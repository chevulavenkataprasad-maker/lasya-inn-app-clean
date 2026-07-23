// src/components/pages/UserNotifications.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../../firebase/notificationService';

const UserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications(user?.uid);
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

  if (!user) {
    return <div>Please login to see notifications</div>;
  }

  return (
    <div className="user-notifications">
      <h3>📬 My Notifications</h3>
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
                {notification.type === 'booking_confirmed' ? '✅' : '📋'}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-details">
                  <span>🛏️ {notification.roomName}</span>
                  <span>📅 {notification.checkInDate}</span>
                </div>
                <div className="notification-time">
                  {notification.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserNotifications;