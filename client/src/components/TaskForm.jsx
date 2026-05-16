import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/** Normalize to +94XXXXXXXXX (9 digits after country code) */
function normalizePhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith('94')) digits = digits.slice(2);
  if (digits.length > 9) digits = digits.slice(0, 9);
  return digits ? `+94${digits}` : '+94';
}

const CATEGORIES = ['Tutoring', 'Design', 'Delivery', 'Tech', 'Writing', 'Other'];
const STATUSES = ['Available', 'Hired', 'In Progress', 'Completed'];

const EMPTY = {
  title: '',
  description: '',
  category: 'Tutoring',
  budget: '',
  contactEmail: '',
  contactPhone: '',
  status: 'Available',
};

export default function TaskForm({ open, task, onClose, onSubmit }) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(task);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        category: task.category,
        budget: String(task.budget),
        contactEmail: task.contactEmail || '',
        contactPhone: task.contactPhone || '',
        status: task.status || 'Available',
      });
    } else {
      setForm({
        ...EMPTY,
        contactEmail: user?.email || '',
      });
    }
  }, [open, task, user]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title,
        description: form.description,
        category: form.category,
        budget: Number(form.budget),
        contactEmail: form.contactEmail.trim(),
        contactPhone: normalizePhone(form.contactPhone),
        ...(isEdit ? { status: form.status } : {}),
      });
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
        aria-labelledby="task-form-title"
      >
        <h2 id="task-form-title">{isEdit ? 'Edit gig' : 'Post a new gig'}</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </label>
          <div className="form-row">
            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Budget (Rs.)
              <input
                name="budget"
                type="number"
                min="100"
                step="100"
                value={form.budget}
                onChange={handleChange}
                required
                placeholder="e.g. 2500"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Contact email
              <input
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Contact phone (Sri Lanka)
              <input
                name="contactPhone"
                type="tel"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, contactPhone: normalizePhone(e.target.value) }))
                }
                required
                placeholder="+94771234567"
                pattern="\+94\d{9}"
                title="+94 followed by 9 digits, e.g. +94771234567"
              />
              <span className="field-hint">Format: +94XXXXXXXXX</span>
            </label>
          </div>
          {isEdit && (
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Post gig'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
