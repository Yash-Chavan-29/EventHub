import React, { useEffect, useState } from 'react';
import api from '../api/api';

const NotificationsDropdown = ({ onUnreadCountChange, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
      const unreadCount = data.filter((n) => !n.isRead).length;
      onUnreadCountChange(unreadCount);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notifications:', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.put(`/notifications/${id}/read`);
      // Update state locally
      const updated = notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n));
      setNotifications(updated);
      const unreadCount = updated.filter((n) => !n.isRead).length;
      onUnreadCountChange(unreadCount);
    } catch (error) {
      console.error('Failed to mark notification as read:', error.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      onUnreadCountChange(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error.message);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h3>Notifications</h3>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="notifications-clear">
            Mark all read
          </button>
        )}
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          <div className="notification-empty">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">No notifications yet</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleMarkAsRead(item._id, item.isRead)}
              className={`notification-item ${!item.isRead ? 'unread' : ''}`}
              style={{ cursor: item.isRead ? 'default' : 'pointer' }}
            >
              <div className="notification-item-title">{item.title}</div>
              <div className="notification-item-message">{item.message}</div>
              <div className="notification-item-time">{formatTimeAgo(item.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
