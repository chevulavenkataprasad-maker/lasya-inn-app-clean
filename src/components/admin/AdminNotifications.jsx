// src/components/admin/AdminNotifications.jsx

import React, { useState, useEffect } from 'react';
import { getAdminNotifications, markNotificationAsRead } from '../../firebase/notificationService';
import { useNavigate } from 'react-router-dom';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getAdminNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="admin-notifications">
      <div className="notifications-header">
        <h3>🔔 Notifications</h3>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount} new</span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleMarkRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'new_booking' ? '🆕' : '✅'}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-details">
                  <span>👤 {notification.guestName}</span>
                  <span>📱 {notification.guestPhone}</span>
                  <span>🛏️ {notification.roomName}</span>
                </div>
                <div className="notification-time">
                  {notification.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                </div>
              </div>
              {!notification.read && (
                <div className="unread-dot">●</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;