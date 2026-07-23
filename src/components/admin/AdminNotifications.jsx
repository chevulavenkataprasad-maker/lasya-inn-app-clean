// src/components/admin/AdminNotifications.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { markNotificationAsRead } from '../../firebase/notificationService';
import { playNotificationSound } from '../../utils/soundService';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // ============================================
  // ✅ REAL-TIME LISTENER FOR ADMIN NOTIFICATIONS
  // ============================================
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('target', '==', 'admin')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      let newCount = 0;
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docData = { id: change.doc.id, ...change.doc.data() };
          data.push(docData);
          newCount++;
          console.log('🆕 New admin notification:', docData);
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
      
      console.log('🔔 Admin notifications:', data.length, 'unread:', unread);
      
      // ✅ Play sound for new admin notifications
      if (newCount > 0) {
        playNotificationSound('admin');
      }
    });

    return () => {
      console.log('🔴 Unsubscribing from admin notifications');
      unsubscribe();
    };
  }, []);

  const handleMarkRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  return (
    <div className="admin-notifications">
      <div 
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <span>🔔 Notifications</span>
            <span className="unread-count">{unreadCount} new</span>
          </div>

          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notification-list">
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
      )}
    </div>
  );
};

export default AdminNotifications;