import { useEffect, useState } from 'react';

export default function RatingModal({ task, currentUserId, open, onClose, onSubmit }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const existing = task?.ratings?.find((r) => r.user?._id === currentUserId);

  useEffect(() => {
    if (!open || !task) return;
    if (existing) {
      setStars(existing.stars);
      setComment(existing.comment || '');
    } else {
      setStars(5);
      setComment('');
    }
  }, [open, task, existing]);

  if (!open || !task) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ stars, comment });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-title"
      >
        <h2 id="rating-title">Rate this gig</h2>
        <p className="modal-subtitle">
          How well was &ldquo;{task.title}&rdquo; completed?
        </p>
        <form onSubmit={handleSubmit} className="task-form">
          <label>
            Stars (1–5)
            <select value={stars} onChange={(e) => setStars(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </label>
          <label>
            Comment (optional)
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Share your experience…"
            />
          </label>
          {existing && (
            <p className="hint">You already rated this gig — submitting will update your rating.</p>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Submit rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
