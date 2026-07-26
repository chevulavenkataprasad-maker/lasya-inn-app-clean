// src/services/emailService.js

import emailjs from '@emailjs/browser';

// ✅ Your EmailJS Credentials
const PUBLIC_KEY = 'Q08ZLY2vmom8_MgYJ';
const SERVICE_ID = 'service_txjx1g8';

// ✅ IMPORTANT: Check these Template IDs match EmailJS
const ADMIN_TEMPLATE = 'template_03q5sai';   // Admin Template ID
const USER_TEMPLATE = 'template_n26isel';    // User Template ID

const ADMIN_EMAIL = 'lasyainnrooms@gmail.com';

// ✅ Initialize EmailJS
emailjs.init({
  publicKey: PUBLIC_KEY,
  blockHeadless: false,
  limitRate: {
    id: 'app',
    throttle: 10000,
  },
});

console.log('📧 EmailJS Config:', {
  serviceId: SERVICE_ID,
  adminTemplate: ADMIN_TEMPLATE,
  userTemplate: USER_TEMPLATE,
});

// ============================================
// ✅ SEND EMAIL TO USER
// ============================================
export const sendUserEmail = async (data) => {
  try {
    console.log('📧 Sending user email...');
    console.log('📧 Data:', data);

    if (!data.guestEmail || data.guestEmail.trim() === '') {
      console.error('❌ No guestEmail');
      return { success: false, error: 'No guestEmail' };
    }

    const cleanEmail = data.guestEmail.trim();

    const templateParams = {
      to_email: cleanEmail,
      from_name: 'Lasya Inn Rooms',
      guest_name: data.guestName || 'Guest',
      guest_phone: data.guestPhone || 'N/A',
      room_name: data.roomName || 'Room',
      check_in_date: data.checkInDate || 'N/A',
      check_in_time: data.checkInTime || 'N/A',
      check_out_date: data.checkOutDate || 'N/A',
      check_out_time: data.checkOutTime || 'N/A',
      total_price: data.totalPrice || 0,
      booking_id: data.bookingId || 'N/A',
      total_hours: data.totalHours || 24
    };

    console.log('📋 Sending with params:', templateParams);

    // ✅ Send using USER_TEMPLATE
    const result = await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams);
    console.log('✅ User email sent to:', cleanEmail);
    return { success: true, messageId: result.text };

  } catch (error) {
    console.error('❌ User email error:', error);
    return { success: false, error: error.text || error.message };
  }
};

// ============================================
// ✅ SEND EMAIL TO ADMIN
// ============================================
export const sendAdminEmail = async (data) => {
  try {
    console.log('📧 Sending admin email...');

    const templateParams = {
      to_email: ADMIN_EMAIL,
      from_name: 'Lasya Inn Rooms',
      guest_name: data.guestName || 'Guest',
      guest_phone: data.guestPhone || 'N/A',
      guest_email: data.guestEmail || 'N/A',
      room_name: data.roomName || 'Room',
      check_in_date: data.checkInDate || 'N/A',
      check_in_time: data.checkInTime || 'N/A',
      check_out_date: data.checkOutDate || 'N/A',
      check_out_time: data.checkOutTime || 'N/A',
      total_price: data.totalPrice || 0,
      booking_id: data.bookingId || 'N/A',
      admin_url: 'https://www.lasyainnroom.com/admin/bookings'
    };

    // ✅ Send using ADMIN_TEMPLATE
    const result = await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE, templateParams);
    console.log('✅ Admin email sent to:', ADMIN_EMAIL);
    return { success: true, messageId: result.text };

  } catch (error) {
    console.error('❌ Admin email error:', error);
    return { success: false, error: error.text || error.message };
  }
};