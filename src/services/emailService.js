// src/services/emailService.js

import emailjs from '@emailjs/browser';

// ✅ Your EmailJS Credentials
const PUBLIC_KEY = 'Q08ZLY2vmom8_MgYJ';
const SERVICE_ID = 'service_txjx1g8';
const ADMIN_TEMPLATE = 'template_03q5sai';   // ✅ New Admin Template
const USER_TEMPLATE = 'template_n26isel';    // ✅ New User Template
const ADMIN_EMAIL = 'lasyainnrooms@gmail.com';

// ✅ FIXED: Initialize EmailJS with single object (not deprecated)
emailjs.init({
  publicKey: PUBLIC_KEY,
  // Do not block headless browsers
  blockHeadless: false,
  limitRate: {
    // Set the limit of requests per second
    id: 'app',
    throttle: 10000,  // 10 seconds between requests
  },
});

console.log('📧 EmailJS initialized with:', {
  publicKey: PUBLIC_KEY ? '✅ Set' : '❌ Missing',
  serviceId: SERVICE_ID ? '✅ Set' : '❌ Missing',
  adminTemplate: ADMIN_TEMPLATE ? '✅ Set' : '❌ Missing',
  userTemplate: USER_TEMPLATE ? '✅ Set' : '❌ Missing',
  adminEmail: ADMIN_EMAIL ? '✅ Set' : '❌ Missing'
});

// ============================================
// ✅ SEND EMAIL TO ADMIN (New Booking)
// ============================================
export const sendAdminEmail = async (data) => {
  try {
    console.log('📧 Sending admin email...');
    console.log('📧 Admin Email Data:', data);

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

    console.log('📋 Admin Template Params:', templateParams);

    const result = await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE, templateParams);
    console.log('✅ Admin email sent to:', ADMIN_EMAIL);
    return { success: true, messageId: result.text };

  } catch (error) {
    console.error('❌ Admin email error:', error);
    return { success: false, error: error.text || error.message };
  }
};

// ============================================
// ✅ SEND EMAIL TO USER (Booking Confirmed)
// ============================================
export const sendUserEmail = async (data) => {
  try {
    console.log('📧 Sending user email...');

    if (!data.guestEmail || data.guestEmail.trim() === '') {
      console.error('❌ No guestEmail provided or empty');
      return { success: false, error: 'No guestEmail provided' };
    }

    const cleanEmail = data.guestEmail.trim();
    console.log('📧 Clean Email:', cleanEmail);

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

    console.log('📋 User Template Params:', templateParams);
    console.log('📧 To Email:', templateParams.to_email);

    const result = await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams);
    console.log('✅ User email sent to:', cleanEmail);
    return { success: true, messageId: result.text };

  } catch (error) {
    console.error('❌ User email error:', error);
    return { success: false, error: error.text || error.message, status: error.status };
  }
};

// ============================================
// ✅ TEST EMAIL FUNCTION
// ============================================
export const testEmail = async (email) => {
  try {
    const templateParams = {
      to_email: email || ADMIN_EMAIL,
      from_name: 'Lasya Inn Rooms',
      guest_name: 'Test Guest',
      guest_phone: '9999999999',
      room_name: 'Test Room',
      check_in_date: '25/07/2026',
      check_in_time: '12:00',
      check_out_date: '27/07/2026',
      check_out_time: '11:00',
      total_price: '3000',
      booking_id: 'TEST123',
      total_hours: 48
    };

    const result = await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams);
    console.log('✅ Test email sent:', result.text);
    return { success: true };
  } catch (error) {
    console.error('❌ Test email error:', error);
    return { success: false, error: error.text };
  }
};