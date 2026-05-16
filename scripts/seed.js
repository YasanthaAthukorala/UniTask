/**
 * Seed UniTask with sample users, gigs, ratings, and notifications.
 * Run: npm run seed
 *
 * Demo logins (password for all): password123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const DEMO_PASSWORD = 'password123';

const USERS = [
  { name: 'Alex Chen', email: 'alex@campus.lk' },
  { name: 'Jordan Lee', email: 'jordan@campus.lk' },
  { name: 'Sam Rivera', email: 'sam@campus.lk' },
  { name: 'Taylor Kim', email: 'taylor@campus.lk' },
];

async function seed() {
  if (!process.env.MONGO_URL) {
    console.error('MONGO_URL is missing from .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to MongoDB');

  await Promise.all([
    Notification.deleteMany({}),
    Task.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('Cleared existing users, gigs, and notifications');

  const users = {};
  for (const u of USERS) {
    const doc = await User.create({ ...u, password: DEMO_PASSWORD });
    users[u.email] = doc;
    console.log(`  User: ${u.name} <${u.email}>`);
  }

  const alex = users['alex@campus.lk'];
  const jordan = users['jordan@campus.lk'];
  const sam = users['sam@campus.lk'];
  const taylor = users['taylor@campus.lk'];

  const gigs = [
    {
      title: 'Calculus II tutoring',
      description: 'Need help with integration techniques and practice problems before midterm.',
      category: 'Tutoring',
      budget: 3500,
      contactEmail: 'alex@campus.lk',
      contactPhone: '+94771234567',
      status: 'Available',
      postedBy: alex._id,
    },
    {
      title: 'Club logo redesign',
      description: 'Modern minimalist logo for the robotics club. Provide 2–3 concepts.',
      category: 'Design',
      budget: 8000,
      contactEmail: 'alex@campus.lk',
      contactPhone: '+94771234567',
      status: 'Hired',
      postedBy: alex._id,
      hiredBy: jordan._id,
      hiredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Python homework help',
      description: 'Debug a Flask REST API assignment. About 2 hours of pair programming.',
      category: 'Tech',
      budget: 4500,
      contactEmail: 'jordan@campus.lk',
      contactPhone: '+94762345678',
      status: 'Available',
      postedBy: jordan._id,
    },
    {
      title: 'Campus grocery delivery',
      description: 'Pick up items from supermarket and deliver to hostel. List provided.',
      category: 'Delivery',
      budget: 2000,
      contactEmail: 'jordan@campus.lk',
      contactPhone: '+94762345678',
      status: 'Completed',
      postedBy: jordan._id,
      hiredBy: sam._id,
      hiredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ratings: [
        { user: sam._id, stars: 5, comment: 'Fast and friendly — would hire again!' },
      ],
    },
    {
      title: 'Essay proofreading (1000 words)',
      description: 'Polish grammar and flow for a history essay. APA citations already done.',
      category: 'Writing',
      budget: 2500,
      contactEmail: 'sam@campus.lk',
      contactPhone: '+94773456789',
      status: 'Available',
      postedBy: sam._id,
    },
    {
      title: 'Laptop setup for freshman',
      description: 'Install Office, VPN, and printer drivers on Windows laptop.',
      category: 'Tech',
      budget: 3000,
      contactEmail: 'taylor@campus.lk',
      contactPhone: '+94774567890',
      status: 'In Progress',
      postedBy: taylor._id,
      hiredBy: alex._id,
      hiredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Statistics lab report',
      description: 'Help interpret SPSS output and write the results section.',
      category: 'Tutoring',
      budget: 4000,
      contactEmail: 'taylor@campus.lk',
      contactPhone: '+94774567890',
      status: 'Available',
      postedBy: taylor._id,
    },
    {
      title: 'Poster for charity bake sale',
      description: 'Eye-catching A3 poster. Brand colours and logo will be shared.',
      category: 'Design',
      budget: 5000,
      contactEmail: 'sam@campus.lk',
      contactPhone: '+94773456789',
      status: 'Completed',
      postedBy: sam._id,
      hiredBy: jordan._id,
      hiredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      ratings: [
        { user: jordan._id, stars: 4, comment: 'Great design, minor revision needed on fonts.' },
        { user: alex._id, stars: 5, comment: 'Looked professional at the event.' },
      ],
    },
  ];

  const createdTasks = [];
  for (const gig of gigs) {
    const task = new Task(gig);
    if (task.ratings?.length) task.recalculateRating();
    await task.save();
    createdTasks.push(task);
    console.log(`  Gig: ${task.title} [${task.status}] — Rs. ${task.budget}`);
  }

  const hiredGigs = createdTasks.filter((t) => t.hiredBy && t.status !== 'Completed');
  for (const task of hiredGigs) {
    const hirer = await User.findById(task.hiredBy);
    const owner = await User.findById(task.postedBy);
    await Notification.create({
      recipient: task.postedBy,
      type: 'gig_hired',
      message: `${hirer.name} hired your gig "${task.title}"`,
      task: task._id,
      relatedUser: task.hiredBy,
      read: task.title.includes('logo') ? true : false,
    });
    console.log(`  Notification → ${owner.name}: hired "${task.title}"`);
  }

  const pythonGig = createdTasks.find((t) => t.title.includes('Python'));
  if (pythonGig) {
    await Notification.create({
      recipient: jordan._id,
      type: 'gig_hired',
      message: `${sam.name} is interested in your gig "${pythonGig.title}"`,
      task: pythonGig._id,
      relatedUser: sam._id,
      read: false,
    });
  }

  console.log('\n✓ Sample data ready (Sri Lankan Rs. & +94 contacts)!\n');
  console.log('Log in with any account (password: password123):\n');
  USERS.forEach((u) => console.log(`  ${u.email}`));
  console.log('');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
