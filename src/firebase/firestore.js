// src/firebase/firestore.js

import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  setDoc,
  onSnapshot
} from 'firebase/firestore';

// Collections
const roomsCollection = collection(db, 'rooms');
const bookingsCollection = collection(db, 'bookings');
const reviewsCollection = collection(db, 'reviews');
const galleryCollection = collection(db, 'gallery');
const settingsCollection = collection(db, 'settings');

// ============================================
// ROOM FUNCTIONS
// ============================================

// Add Room
export const addRoom = async (roomData) => {
  try {
    const docRef = await addDoc(roomsCollection, {
      ...roomData,
      createdAt: new Date().toISOString()
    });
    console.log('✅ Room added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding room:', error);
    throw error;
  }
};

// Get All Rooms
export const getRooms = async () => {
  try {
    const snapshot = await getDocs(roomsCollection);
    const rooms = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    console.log('✅ Rooms fetched:', rooms.length);
    return rooms;
  } catch (error) {
    console.error('❌ Error fetching rooms:', error);
    return [];
  }
};

// Get Single Room
export const getRoom = async (id) => {
  try {
    const docRef = doc(db, 'rooms', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('❌ Error fetching room:', error);
    return null;
  }
};

// Update Room
export const updateRoom = async (id, data) => {
  try {
    const docRef = doc(db, 'rooms', id);
    await updateDoc(docRef, data);
    console.log('✅ Room updated:', id);
    return true;
  } catch (error) {
    console.error('❌ Error updating room:', error);
    throw error;
  }
};

// Delete Room
export const deleteRoom = async (id) => {
  try {
    const docRef = doc(db, 'rooms', id);
    await deleteDoc(docRef);
    console.log('✅ Room deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting room:', error);
    throw error;
  }
};

// ============================================
// ✅ BOOKING FUNCTIONS - FIXED (No orderBy)
// ============================================

// Add Booking
export const addBooking = async (bookingData) => {
  try {
    const docRef = await addDoc(bookingsCollection, {
      ...bookingData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    console.log('✅ Booking added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding booking:', error);
    throw error;
  }
};

// ✅ Get User Bookings - FIXED (No orderBy)
export const getUserBookings = async (userId) => {
  try {
    const q = query(
      bookingsCollection, 
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc') // ← Temporary removed to fix index error
    );
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    console.log('✅ User bookings fetched:', bookings.length);
    return bookings;
  } catch (error) {
    console.error('❌ Error fetching user bookings:', error);
    return []; // Return empty array instead of throwing
  }
};

// ✅ Get All Bookings - FIXED (No orderBy)
export const getAllBookings = async () => {
  try {
    const q = query(bookingsCollection);
    // const q = query(bookingsCollection, orderBy('createdAt', 'desc')); // ← Temporary removed
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    console.log('✅ All bookings fetched:', bookings.length);
    return bookings;
  } catch (error) {
    console.error('❌ Error fetching all bookings:', error);
    return []; // Return empty array instead of throwing
  }
};

// Update Booking Status
export const updateBookingStatus = async (id, status) => {
  try {
    const docRef = doc(db, 'bookings', id);
    await updateDoc(docRef, { status });
    console.log('✅ Booking status updated:', id, status);
    return true;
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    throw error;
  }
};

// Delete Booking
export const deleteBooking = async (id) => {
  try {
    const docRef = doc(db, 'bookings', id);
    await deleteDoc(docRef);
    console.log('✅ Booking deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    throw error;
  }
};

// Get Booking by ID
export const getBooking = async (id) => {
  try {
    const docRef = doc(db, 'bookings', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    return null;
  }
};

// ============================================
// ✅ CANCEL BOOKING
// ============================================
export const cancelBooking = async (bookingId) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const snapshot = await getDoc(bookingRef);
    
    if (!snapshot.exists()) {
      throw new Error('Booking not found');
    }
    
    const booking = snapshot.data();
    
    if (booking.status === 'cancelled') {
      throw new Error('Booking already cancelled');
    }
    
    if (booking.status === 'completed') {
      throw new Error('Cannot cancel completed booking');
    }
    
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Booking cancelled:', bookingId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    throw error;
  }
};

// ============================================
// ✅ REVIEWS FUNCTIONS - FIXED (No orderBy)
// ============================================

// Add Review
export const addReview = async (reviewData) => {
  try {
    const docRef = await addDoc(reviewsCollection, {
      ...reviewData,
      createdAt: new Date().toISOString()
    });
    console.log('✅ Review added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding review:', error);
    throw error;
  }
};

// ✅ Get All Reviews - FIXED (No orderBy)
export const getReviews = async () => {
  try {
    const q = query(reviewsCollection);
    // const q = query(reviewsCollection, orderBy('createdAt', 'desc')); // ← Temporary removed
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    console.log('✅ Reviews fetched:', reviews.length);
    return reviews;
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return [];
  }
};

// ✅ Real-time Reviews Listener - FIXED (No orderBy)
export const listenReviews = (callback) => {
  const q = query(reviewsCollection);
  // const q = query(reviewsCollection, orderBy('createdAt', 'desc')); // ← Temporary removed
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(reviews);
  });
};

// ✅ Get Reviews by User - FIXED (No orderBy)
export const getReviewsByUser = async (userId) => {
  try {
    const q = query(
      reviewsCollection, 
      where('userId', '==', userId)
      // orderBy('createdAt', 'desc') // ← Temporary removed
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error fetching user reviews:', error);
    return [];
  }
};

// Delete Review
export const deleteReview = async (id) => {
  try {
    const docRef = doc(db, 'reviews', id);
    await deleteDoc(docRef);
    console.log('✅ Review deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    throw error;
  }
};

// Update Review
export const updateReview = async (id, data) => {
  try {
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, data);
    console.log('✅ Review updated:', id);
    return true;
  } catch (error) {
    console.error('❌ Error updating review:', error);
    throw error;
  }
};

// ============================================
// ✅ GALLERY FUNCTIONS - FIXED (No orderBy)
// ============================================

// Add Gallery Image
export const addGalleryImage = async (imageData) => {
  try {
    const docRef = await addDoc(galleryCollection, {
      ...imageData,
      createdAt: new Date().toISOString()
    });
    console.log('✅ Gallery image added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding gallery image:', error);
    throw error;
  }
};

// ✅ Get Gallery Images - FIXED (No orderBy)
export const getGalleryImages = async () => {
  try {
    const q = query(galleryCollection);
    // const q = query(galleryCollection, orderBy('createdAt', 'desc')); // ← Temporary removed
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error fetching gallery:', error);
    return [];
  }
};

// Delete Gallery Image
export const deleteGalleryImage = async (imageId) => {
  try {
    if (!imageId) {
      throw new Error('Image ID is required');
    }
    const docRef = doc(db, 'gallery', imageId);
    await deleteDoc(docRef);
    console.log('✅ Gallery image deleted:', imageId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting gallery image:', error);
    throw error;
  }
};

// Get Single Gallery Image
export const getGalleryImage = async (id) => {
  try {
    const docRef = doc(db, 'gallery', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('❌ Error fetching gallery image:', error);
    return null;
  }
};

// Update Gallery Image
export const updateGalleryImage = async (id, data) => {
  try {
    const docRef = doc(db, 'gallery', id);
    await updateDoc(docRef, data);
    console.log('✅ Gallery image updated:', id);
    return true;
  } catch (error) {
    console.error('❌ Error updating gallery image:', error);
    throw error;
  }
};

// ✅ Get Gallery Images by Category - FIXED (No orderBy)
export const getGalleryImagesByCategory = async (category) => {
  try {
    const q = query(
      galleryCollection, 
      where('category', '==', category)
      // orderBy('createdAt', 'desc') // ← Temporary removed
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ Error fetching gallery by category:', error);
    return [];
  }
};

// ============================================
// LOCATION FUNCTIONS
// ============================================

// Get Location Data
export const getLocation = async () => {
  try {
    const docRef = doc(db, 'settings', 'location');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('❌ Error fetching location:', error);
    return null;
  }
};

// Update Location Data
export const updateLocation = async (data) => {
  try {
    const docRef = doc(db, 'settings', 'location');
    await setDoc(docRef, data, { merge: true });
    console.log('✅ Location updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating location:', error);
    throw error;
  }
};

// ============================================
// SETTINGS FUNCTIONS
// ============================================

// Get Settings
export const getSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'general');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return null;
  }
};

// Update Settings
export const updateSettings = async (data) => {
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, data, { merge: true });
    console.log('✅ Settings updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    throw error;
  }
};

// ============================================
// CONTACT FUNCTIONS
// ============================================

// Get Contact Info
export const getContactInfo = async () => {
  try {
    const docRef = doc(db, 'settings', 'contact');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('❌ Error fetching contact info:', error);
    return null;
  }
};

// Update Contact Info
export const updateContactInfo = async (data) => {
  try {
    const docRef = doc(db, 'settings', 'contact');
    await setDoc(docRef, data, { merge: true });
    console.log('✅ Contact info updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating contact info:', error);
    throw error;
  }
};