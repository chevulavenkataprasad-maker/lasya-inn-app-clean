// src/components/pages/UserNotifications.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { markNotificationAsRead } from '../../firebase/notificationService';
// ❌ Remove sound import
// import { playNotificationSound } from '../../utils/soundService';

const UserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ============================================
  // ✅ REAL-TIME LISTENER FOR USER NOTIFICATIONS (NO SOUND)
  // ============================================
  useEffect(() => {
    if (!user) {
      console.log('⚠️ No user logged in');
      return;
    }

    console.log('👤 Setting up listener for user:', user.uid);

    const q = query(
      collection(db, 'notifications'),
      where('target', '==', 'user'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docData = { id: change.doc.id, ...change.doc.data() };
          data.push(docData);
        }
      });
      
      snapshot.forEach((doc) => {
        if (!data.find(n => n.id === doc.id)) {
          data.push({ id: doc.id, ...doc.data() });
        }
      });
      
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setNotifications(data);
      
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      console.log('📬 Notifications updated:', data.length, 'unread:', unread);
      
      // ❌ Remove sound
      // if (newCount > 0) {
      //   playNotificationSound('user');
      // }
    });

    return () => {
      console.log('🔴 Unsubscribing from user notifications');
      unsubscribe();
    };
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