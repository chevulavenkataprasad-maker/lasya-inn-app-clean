// src/services/emailService.js

import emailjs from '@emailjs/browser';

const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const ADMIN_TEMPLATE = process.env.REACT_APP_EMAILJS_ADMIN_TEMPLATE;
const USER_TEMPLATE = process.env.REACT_APP_EMAILJS_USER_TEMPLATE;
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

emailjs.init(PUBLIC_KEY);

console.log('📧 EmailJS initialized');

// ============================================
// ✅ SEND EMAIL TO ADMIN (New Booking)
// ============================================
export const sendAdminEmail = async (data) => {
  try {
    const templateParams = {
      to_email: ADMIN_EMAIL,
      guest_name: data.guestName,
      guest_phone: data.guestPhone,
      room_name: data.roomName,
      check_in_date: data.checkInDate,
      check_in_time: data.checkInTime,
      check_out_date: data.checkOutDate,
      check_out_time: data.checkOutTime,
      total_price: data.totalPrice,
      booking_id: data.bookingId,
      admin_url: 'https://www.lasyainnroom.com/admin/bookings'
    };

    const result = await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE, templateParams);
    console.log('✅ Admin email sent:', result.text);
    return { success: true };

  } catch (error) {
    console.error('❌ Admin email error:', error);
    return { success: false, error: error.text };
  }
};

// ============================================
// ✅ SEND EMAIL TO USER (Booking Confirmed)
// ============================================
export const sendUserEmail = async (data) => {
  try {
    const templateParams = {
      to_email: data.guestEmail,
      guest_name: data.guestName,
      room_name: data.roomName,
      check_in_date: data.checkInDate,
      check_in_time: data.checkInTime,
      check_out_date: data.checkOutDate,
      check_out_time: data.checkOutTime,
      total_price: data.totalPrice,
      booking_id: data.bookingId
    };

    const result = await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams);
    console.log('✅ User email sent:', result.text);
    return { success: true };

  } catch (error) {
    console.error('❌ User email error:', error);
    return { success: false, error: error.text };
  }
};