// src/components/pages/UserNotifications.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { markNotificationAsRead } from '../../firebase/notificationService';
import { playNotificationSound } from '../../utils/soundService';
import './UserNotifications.css';

const UserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCount = useRef(0);

  // ✅ REAL-TIME LISTENER WITH SOUND
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('target', '==', 'user'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = [];
      let newCount = 0;
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docData = { id: change.doc.id, ...change.doc.data() };
          allData.push(docData);
          newCount++;
        }
      });
      
      snapshot.forEach((doc) => {
        if (!allData.find(n => n.id === doc.id)) {
          allData.push({ id: doc.id, ...doc.data() });
        }
      });
      
      allData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setNotifications(allData);
      
      const unread = allData.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      // ✅ Play sound when new notification arrives
      if (newCount > 0 && unread > prevUnreadCount.current) {
        playNotificationSound('user');
        prevUnreadCount.current = unread;
      }
      
      prevUnreadCount.current = unread;
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  if (!user) {
    return <div className="login-message">Please login to see notifications</div>;
  }

  return (
    <div className="user-notifications-page">
      <div className="notifications-header">
        <h3>📬 My Notifications</h3>
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
                {notification.type === 'booking_confirmed' ? '✅' : '📋'}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-details">
                  <span>🛏️ {notification.roomName}</span>
                  <span>📅 {notification.checkInDate}</span>
                  <span>💰 ₹{notification.totalPrice}</span>
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

export default UserNotifications;