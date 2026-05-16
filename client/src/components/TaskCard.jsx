import { formatCurrency, formatPhone } from '../utils/format';

const STATUS_CLASS = {
  Available: 'status-available',
  Hired: 'status-hired',
  'In Progress': 'status-progress',
  Completed: 'status-completed',
};

function Stars({ value }) {
  const full = Math.round(value || 0);
  return (
    <span className="stars" aria-label={`${value || 0} out of 5 stars`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  );
}

export default function TaskCard({
  task,
  isOwner,
  currentUserId,
  onEdit,
  onDelete,
  onRate,
  onHire,
}) {
  const statusClass = STATUS_CLASS[task.status] || 'status-available';
  const posterName = task.postedBy?.name || 'Unknown';
  const hiredName = task.hiredBy?.name;
  const userRating = task.ratings?.find((r) => r.user?._id === currentUserId);
  const canRate = !isOwner && task.status === 'Completed';
  const canHire = !isOwner && task.status === 'Available';
  const isHirer =
    task.hiredBy && String(task.hiredBy._id || task.hiredBy) === String(currentUserId);

  return (
    <article className={`task-card ${isOwner ? 'task-card-mine' : ''}`}>
      <div className="task-card-top">
        <span className="task-category">{task.category}</span>
        <span className={`task-status ${statusClass}`}>{task.status}</span>
      </div>
      {isOwner && <span className="badge-mine">Your gig</span>}
      {isHirer && <span className="badge-hired">You hired this</span>}
      <h3 className="task-title">{task.title}</h3>
      <p className="task-description">{task.description}</p>

      <div className="contact-box">
        <span className="contact-label">Contact</span>
        <a href={`mailto:${task.contactEmail}`} className="contact-line">
          {task.contactEmail}
        </a>
        <a href={`tel:${task.contactPhone.replace(/\s/g, '')}`} className="contact-line">
          {formatPhone(task.contactPhone)}
        </a>
      </div>

      {isOwner && hiredName && (
        <p className="hired-info">
          Hired by <strong>{hiredName}</strong>
          {task.hiredBy?.email && ` · ${task.hiredBy.email}`}
        </p>
      )}

      <div className="task-rating-row">
        <Stars value={task.averageRating} />
        <span className="rating-meta">
          {task.ratingCount > 0
            ? `${task.averageRating} (${task.ratingCount})`
            : 'No ratings yet'}
        </span>
      </div>
      <div className="task-meta">
        <span className="task-budget">{formatCurrency(task.budget)}</span>
        <span className="task-poster">by {posterName}</span>
      </div>
      <div className="task-actions">
        {isOwner ? (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => onEdit(task)}>
              Edit
            </button>
            <button type="button" className="btn btn-danger" onClick={() => onDelete(task._id)}>
              Delete
            </button>
          </>
        ) : (
          <>
            {canHire && (
              <button type="button" className="btn btn-primary" onClick={() => onHire(task)}>
                Hire / Purchase
              </button>
            )}
            {canRate && (
              <button type="button" className="btn btn-ghost" onClick={() => onRate(task)}>
                {userRating ? 'Update rating' : 'Rate completion'}
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
