import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import * as notifApi from '../api/notifications';

export default function Header({ onPostClick }) {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await notifApi.fetchNotifications();
      setUnreadCount(data.unreadCount);
    } catch {
      /* ignore when not logged in */
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 30000);
    return () => clearInterval(interval);
  }, [refreshUnread]);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-mark">U</span>
          <div>
            <h1 className="brand-title">UniTask</h1>
            <p className="brand-tagline">Student gig marketplace</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="user-greeting">Hi, {user?.name}</span>
          <div className="notif-wrap">
            <button
              type="button"
              className="btn btn-ghost notif-btn"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            >
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              onUnreadChange={setUnreadCount}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={onPostClick}>
            Post a gig
          </button>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
