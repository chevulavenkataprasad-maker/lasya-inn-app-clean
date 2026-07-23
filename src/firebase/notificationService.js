// src/firebase/notificationService.js

import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

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
      target: 'admin',  // ✅ Admin target
      createdAt: serverTimestamp()
    });

    console.log('✅ Admin notification sent to Firestore');
    return { success: true };

  } catch (error) {
    console.error('❌ Admin notification error:', error);
    return { success: false };
  }
};

// ============================================
// ✅ SEND NOTIFICATION TO USER
// ============================================
export const sendUserNotification = async (bookingData) => {
  try {
    const { bookingId, userId, guestName, roomName, checkInDate, checkOutDate, totalPrice } = bookingData;

    // ✅ Validate userId
    if (!userId) {
      console.error('❌ userId is required for user notification');
      return { success: false, error: 'userId missing' };
    }

    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      bookingId: bookingId,
      type: 'booking_confirmed',
      title: '✅ Booking Confirmed!',
      message: `Your booking for ${roomName} is confirmed`,
      guestName: guestName,
      roomName: roomName,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalPrice: totalPrice,
      read: false,
      target: 'user',  // ✅ User target
      userId: userId,  // ✅ User ID (Important!)
      createdAt: serverTimestamp()
    });

    console.log('✅ User notification sent to Firestore');
    return { success: true };

  } catch (error) {
    console.error('❌ User notification error:', error);
    return { success: false };
  }
};

// ============================================
// ✅ GET ADMIN NOTIFICATIONS
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
// ✅ GET USER NOTIFICATIONS
// ============================================
export const getUserNotifications = async (userId) => {
  try {
    if (!userId) {
      console.log('⚠️ No userId provided');
      return [];
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('target', '==', 'user'),
      where('userId', '==', userId),  // ✅ Filter by userId
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
    
    console.log('📬 User notifications fetched:', notifications.length);
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