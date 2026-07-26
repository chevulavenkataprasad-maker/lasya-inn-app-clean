// src/services/emailService.js

import emailjs from '@emailjs/browser';

// ===============================
// EmailJS Configuration
// ===============================
const PUBLIC_KEY = 'Q08ZLY2vmom8_MgYJ';
const SERVICE_ID = 'service_txjx1g8';

const ADMIN_TEMPLATE = 'template_03q5sai';
const USER_TEMPLATE = 'template_n26isel';

const ADMIN_EMAIL = 'lasyainnrooms@gmail.com';

// ===============================
// Initialize EmailJS
// ===============================
emailjs.init({
  publicKey: PUBLIC_KEY,
  blockHeadless: false,
  limitRate: {
    id: 'app',
    throttle: 10000,
  },
});

console.log("✅ EmailJS Initialized");

// ===============================
// Send Email to User
// ===============================
export const sendUserEmail = async (data) => {
  try {

    console.log("📧 Sending User Email...");
    console.log("📦 Received Data:", data);

    const email = (data.guestEmail || "").trim();

    if (!email) {
      console.error("❌ guestEmail is empty");
      return {
        success: false,
        error: "Guest Email Missing"
      };
    }

    const templateParams = {

      // IMPORTANT
      guest_email: email,

      from_name: "Lasya Inn Rooms",

      guest_name: data.guestName || "Guest",

      guest_phone: data.guestPhone || "N/A",

      room_name: data.roomName || "Room",

      check_in_date: data.checkInDate || "N/A",

      check_in_time: data.checkInTime || "N/A",

      check_out_date: data.checkOutDate || "N/A",

      check_out_time: data.checkOutTime || "N/A",

      total_price: data.totalPrice || 0,

      booking_id: data.bookingId || "",

      total_hours: data.totalHours || 24
    };

    console.log("📋 Template Params:");
    console.log(templateParams);

    const response = await emailjs.send(
      SERVICE_ID,
      USER_TEMPLATE,
      templateParams
    );

    console.log("✅ User Email Sent Successfully");
    console.log(response);

    return {
      success: true,
      result: response
    };

  } catch (error) {

    console.error("❌ User Email Error");
    console.error(error);

    return {
      success: false,
      error: error
    };
  }
};

// ===============================
// Send Email to Admin
// ===============================
export const sendAdminEmail = async (data) => {

  try {

    console.log("📧 Sending Admin Email...");

    const templateParams = {

      to_email: ADMIN_EMAIL,

      from_name: "Lasya Inn Rooms",

      guest_name: data.guestName || "Guest",

      guest_phone: data.guestPhone || "N/A",

      guest_email: data.guestEmail || "N/A",

      room_name: data.roomName || "Room",

      check_in_date: data.checkInDate || "N/A",

      check_in_time: data.checkInTime || "N/A",

      check_out_date: data.checkOutDate || "N/A",

      check_out_time: data.checkOutTime || "N/A",

      total_price: data.totalPrice || 0,

      booking_id: data.bookingId || "",

      admin_url: "https://www.lasyainnroom.com/admin/bookings"
    };

    const response = await emailjs.send(
      SERVICE_ID,
      ADMIN_TEMPLATE,
      templateParams
    );

    console.log("✅ Admin Email Sent Successfully");

    return {
      success: true,
      result: response
    };

  } catch (error) {

    console.error("❌ Admin Email Error");
    console.error(error);

    return {
      success: false,
      error: error
    };
  }
};