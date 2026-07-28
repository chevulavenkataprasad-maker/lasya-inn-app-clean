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
  deleteDoc,  // ✅ Add deleteDoc
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
      target: 'admin',
      createdAt: serverTimestamp()
    });

    console.log('✅ Admin notification sent');
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
      target: 'user',
      userId: userId,
      createdAt: serverTimestamp()
    });

    console.log('✅ User notification sent');
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
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('target', '==', 'user'),
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

// ============================================
// ✅ DELETE NOTIFICATION - ADDED
// ============================================
export const deleteNotification = async (notificationId) => {
  try {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    console.log('✅ Notification deleted:', notificationId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ✅ DELETE ALL NOTIFICATIONS - ADDED
// ============================================
export const deleteAllNotifications = async () => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('target', '==', 'admin')
    );
    const snapshot = await getDocs(q);
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    console.log('✅ All admin notifications deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting all notifications:', error);
    return { success: false, error: error.message };
  }
};