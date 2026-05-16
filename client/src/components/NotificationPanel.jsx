import { useEffect, useRef, useState } from 'react';
import * as notifApi from '../api/notifications';

export default function NotificationPanel({ open, onClose, onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const data = await notifApi.fetchNotifications();
      setNotifications(data.notifications);
      onUnreadChange(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  async function handleMarkRead(id) {
    await notifApi.markNotificationRead(id);
    await load();
  }

  async function handleMarkAllRead() {
    await notifApi.markAllNotificationsRead();
    await load();
  }

  if (!open) return null;

  return (
    <div ref={panelRef} className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button type="button" className="btn-link" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>
      {loading ? (
        <p className="notification-empty">Loading…</p>
      ) : notifications.length === 0 ? (
        <p className="notification-empty">No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n._id} className={n.read ? 'notification-item' : 'notification-item unread'}>
              <p>{n.message}</p>
              {n.relatedUser && (
                <span className="notification-meta">
                  From {n.relatedUser.name} · {n.relatedUser.email}
                </span>
              )}
              <time className="notification-time">
                {new Date(n.createdAt).toLocaleString()}
              </time>
              {!n.read && (
                <button type="button" className="btn-link" onClick={() => handleMarkRead(n._id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
