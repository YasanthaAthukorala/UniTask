const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { getIdString, sameId } = require('../utils/ids');

function normalizePhone(value) {
  if (!value) return value;
  let digits = String(value).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith('94')) digits = digits.slice(2);
  return `+94${digits.slice(0, 9)}`;
}

const TASK_POPULATE = [
  { path: 'postedBy', select: 'name email' },
  { path: 'hiredBy', select: 'name email' },
  { path: 'ratings.user', select: 'name' },
];

function buildSort(sort) {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'budget-asc':
      return { budget: 1 };
    case 'budget-desc':
      return { budget: -1 };
    case 'rating-desc':
      return { averageRating: -1, createdAt: -1 };
    case 'rating-asc':
      return { averageRating: 1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

function buildFilter(query) {
  const filter = { postedBy: { $exists: true, $ne: null } };
  const { search, category } = query;

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (search?.trim()) {
    const term = search.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
    ];
  }

  return filter;
}

function ownerCheck(task, res) {
  if (!task.postedBy) {
    res.status(400).json({
      message: 'This gig has no owner (old listing). Delete it and post a new one while logged in.',
    });
    return false;
  }
  return true;
}

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find(buildFilter(req.query))
      .populate(TASK_POPULATE)
      .sort(buildSort(req.query.sort));

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, category, budget, contactEmail, contactPhone } = req.body;
    const task = new Task({
      title,
      description,
      category,
      budget,
      contactEmail,
      contactPhone: normalizePhone(contactPhone),
      postedBy: req.user._id,
    });
    const saved = await task.save();
    await saved.populate(TASK_POPULATE);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!ownerCheck(task, res)) return;
    if (!sameId(task.postedBy, req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own gigs' });
    }

    const { title, description, category, budget, contactEmail, contactPhone, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (budget !== undefined) task.budget = budget;
    if (contactEmail !== undefined) task.contactEmail = contactEmail;
    if (contactPhone !== undefined) task.contactPhone = normalizePhone(contactPhone);
    if (status !== undefined) {
      if (status === 'Available' && task.hiredBy) {
        return res.status(400).json({ message: 'Cannot set to Available while someone has hired this gig' });
      }
      task.status = status;
    }

    await task.save();
    await task.populate(TASK_POPULATE);
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!ownerCheck(task, res)) return;
    if (!sameId(task.postedBy, req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own gigs' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Gig removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

exports.hireTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!ownerCheck(task, res)) return;
    if (sameId(task.postedBy, req.user._id)) {
      return res.status(403).json({ message: 'You cannot hire your own gig' });
    }
    if (task.status !== 'Available') {
      return res.status(400).json({ message: 'This gig is no longer available to hire' });
    }

    task.status = 'Hired';
    task.hiredBy = req.user._id;
    task.hiredAt = new Date();
    await task.save();
    await task.populate(TASK_POPULATE);

    const ownerId = getIdString(task.postedBy);
    if (ownerId) {
      await Notification.create({
        recipient: ownerId,
        type: 'gig_hired',
        message: `${req.user.name} hired your gig "${task.title}"`,
        task: task._id,
        relatedUser: req.user._id,
      });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rateTask = async (req, res) => {
  try {
    const { stars, comment } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!ownerCheck(task, res)) return;
    if (sameId(task.postedBy, req.user._id)) {
      return res.status(403).json({ message: 'You cannot rate your own gig' });
    }
    if (task.status !== 'Completed') {
      return res.status(400).json({ message: 'You can only rate completed gigs' });
    }

    const existing = task.ratings.find((r) => sameId(r.user, req.user._id));
    if (existing) {
      existing.stars = stars;
      existing.comment = comment?.trim() || '';
    } else {
      task.ratings.push({
        user: req.user._id,
        stars,
        comment: comment?.trim() || '',
      });
    }

    task.recalculateRating();
    await task.save();
    await task.populate(TASK_POPULATE);
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
