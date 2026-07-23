// src/firebase/notificationService.js

import { db } from './config';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// ============================================
// ✅ SEND NOTIFICATION TO ADMIN
// ============================================
export const sendAdminNotification = async (bookingData) => {
  try {
    const { bookingId, guestName, guestPhone, roomName, checkInDate, checkOutDate, totalPrice } = bookingData;

    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      bookingId: bookingId,
      type: 'new_booking',
      title: '🆕 New Booking!',
      message: `${guestName} booked ${roomName}`,
      guestName: guestName,
      guestPhone: guestPhone,
      roomName: roomName,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalPrice: totalPrice,
      read: false,
      target: 'admin',
      createdAt: serverTimestamp()
    });

    console.log('✅ Admin notification sent');
    return { success: true };

  } catch (error) {
    console.error('❌ Admin notification error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ✅ SEND NOTIFICATION TO USER (Admin Accept)
// ============================================
export const sendUserNotification = async (bookingData) => {
  try {
    const { bookingId, guestName, guestPhone, roomName, checkInDate, checkOutDate, totalPrice } = bookingData;

    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      bookingId: bookingId,
      type: 'booking_confirmed',
      title: '✅ Booking Confirmed!',
      message: `Your booking for ${roomName} is confirmed`,
      guestName: guestName,
      guestPhone: guestPhone,
      roomName: roomName,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalPrice: totalPrice,
      read: false,
      target: 'user',
      userId: bookingData.userId,
      createdAt: serverTimestamp()
    });

    console.log('✅ User notification sent');
    return { success: true };

  } catch (error) {
    console.error('❌ User notification error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ✅ SEND SMS TO USER (Using Fast2SMS or Twilio)
// ============================================
export const sendSMS = async (phone, message) => {
  try {
    // Fast2SMS API
    const API_KEY = process.env.REACT_APP_FAST2SMS_API_KEY;
    
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'v3',
        sender_id: 'TXTIND',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phone
      })
    });

    const data = await response.json();
    console.log('📱 SMS Response:', data);
    return { success: data.return === true };

  } catch (error) {
    console.error('❌ SMS error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ✅ GET NOTIFICATIONS FOR ADMIN
// ============================================
export const getAdminNotifications = async () => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('target', '==', 'admin'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('❌ Error fetching admin notifications:', error);
    return [];
  }
};

// ============================================
// ✅ GET NOTIFICATIONS FOR USER
// ============================================
export const getUserNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('❌ Error fetching user notifications:', error);
    return [];
  }
};

// ============================================
// ✅ MARK NOTIFICATION AS READ
// ============================================
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error marking notification:', error);
    return { success: false };
  }
};