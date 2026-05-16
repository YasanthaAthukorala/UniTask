import TaskCard from './TaskCard';

export default function GigSection({
  title,
  subtitle,
  tasks,
  emptyMessage,
  currentUserId,
  onEdit,
  onDelete,
  onRate,
  onHire,
  onPostClick,
}) {
  return (
    <section className="gig-section">
      <div className="section-header">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {tasks.length === 0 ? (
        <div className="empty section-empty">
          <p>{emptyMessage}</p>
          {onPostClick && (
            <button type="button" className="btn btn-primary" onClick={onPostClick}>
              Post a gig
            </button>
          )}
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => {
            const owner = task.postedBy?._id || task.postedBy;
            const isOwner = owner && String(owner) === String(currentUserId);
            return (
              <TaskCard
                key={task._id}
                task={task}
                isOwner={isOwner}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
                onRate={onRate}
                onHire={onHire}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
