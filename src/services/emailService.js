// src/services/emailService.js

import emailjs from '@emailjs/browser';

// ✅ Your EmailJS Credentials
const PUBLIC_KEY = 'Q08ZLY2vmom8_MgYJ';
const SERVICE_ID = 'service_txjx1g8';
const ADMIN_TEMPLATE = 'template_wk54ynk';
const USER_TEMPLATE = 'template_le7tyix';
const ADMIN_EMAIL = 'lasyainnrooms@gmail.com';

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

console.log('📧 EmailJS initialized with:', {
  publicKey: PUBLIC_KEY ? '✅ Set' : '❌ Missing',
  serviceId: SERVICE_ID ? '✅ Set' : '❌ Missing',
  adminTemplate: ADMIN_TEMPLATE ? '✅ Set' : '❌ Missing',
  userTemplate: USER_TEMPLATE ? '✅ Set' : '❌ Missing',
  adminEmail: ADMIN_EMAIL ? '✅ Set' : '❌ Missing'
});

// ============================================
// ✅ SEND EMAIL TO ADMIN
// ============================================
export const sendAdminEmail = async (data) => {
  try {
    const templateParams = {
      to_email: ADMIN_EMAIL,
      from_name: 'Lasya Inn Rooms',
      guest_name: data.guestName,
      guest_phone: data.guestPhone,
      room_name: data.roomName,
      check_in_date: data.checkInDate,
      check_in_time: data.checkInTime,
      check_out_date: data.checkOutDate,
      check_out_time: data.checkOutTime,
      total_price: data.totalPrice,
      booking_id: data.bookingId || 'N/A',
      admin_url: 'https://www.lasyainnroom.com/admin/bookings'
    };

    const result = await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE, templateParams);
    console.log('✅ Admin email sent to:', ADMIN_EMAIL);
    return { success: true };

  } catch (error) {
    console.error('❌ Admin email error:', error);
    return { success: false, error: error.text };
  }
};

// ============================================
// ✅ SEND EMAIL TO USER
// ============================================
export const sendUserEmail = async (data) => {
  try {
    const templateParams = {
      to_email: data.guestEmail,
      from_name: 'Lasya Inn Rooms',
      guest_name: data.guestName,
      room_name: data.roomName,
      check_in_date: data.checkInDate,
      check_in_time: data.checkInTime,
      check_out_date: data.checkOutDate,
      check_out_time: data.checkOutTime,
      total_price: data.totalPrice,
      booking_id: data.bookingId || 'N/A'
    };

    const result = await emailjs.send(SERVICE_ID, USER_TEMPLATE, templateParams);
    console.log('✅ User email sent to:', data.guestEmail);
    return { success: true };

  } catch (error) {
    console.error('❌ User email error:', error);
    return { success: false, error: error.text };
  }
};