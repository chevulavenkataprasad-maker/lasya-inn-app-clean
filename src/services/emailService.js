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
// ✅ SEND EMAIL TO ADMIN (New Booking)
// ============================================
export const sendAdminEmail = async (data) => {
  try {
    console.log('📧 Sending admin email...');
    console.log('📧 Admin Email Data:', data);

    // ✅ Validate guestEmail
    if (!data.guestEmail) {
      console.warn('⚠️ No guestEmail provided for admin email');
    }

    const templateParams = {
      to_email: ADMIN_EMAIL,
      from_name: 'Lasya Inn Rooms',
      guest_name: data.guestName || 'Guest',
      guest_phone: data.guestPhone || 'N/A',
      guest_email: data.guestEmail || 'N/A',      // ✅ For Reply To
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
    console.error('❌ Error details:', error.text || error.message);
    return { success: false, error: error.text || error.message };
  }
};

// ============================================
// ✅ SEND EMAIL TO USER (Booking Confirmed)
// ============================================
export const sendUserEmail = async (data) => {
  try {
    console.log('📧 Sending user email...');
    console.log('📧 User Email Data:', data);

    // ✅ Check if guestEmail exists
    if (!data.guestEmail || data.guestEmail === '') {
      console.error('❌ No guestEmail provided');
      return { success: false, error: 'No guestEmail provided' };
    }

    const templateParams = {
      to_email: data.guestEmail,
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
    console.log('✅ User email sent to:', data.guestEmail);
    console.log('✅ Email response:', result.text);
    return { success: true, messageId: result.text };

  } catch (error) {
    console.error('❌ User email error:', error);
    console.error('❌ Error status:', error.status);
    console.error('❌ Error text:', error.text || error.message);
    return { success: false, error: error.text || error.message, status: error.status };
  }
};

// ============================================
// ✅ TEST EMAIL FUNCTION (For debugging)
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