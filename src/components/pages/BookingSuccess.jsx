// src/components/pages/BookingSuccess.jsx

import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BookingSuccess.css';

const BookingSuccess = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { bookingId, booking, paymentId, status } = location.state || {};
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    // Track page view (optional)
    console.log('✅ Booking Success:', { bookingId, booking });
  }, [bookingId, booking]);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 500);
  };

  if (!booking) {
    return (
      <div className="booking-success-container">
        <div className="error-card">
          <h2>❌ Booking Not Found</h2>
          <p>We couldn't find your booking details.</p>
          <Link to="/" className="btn-home">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-success-container">
      <div className="success-card">
        {/* Header */}
        <div className="success-header">
          <div className="success-icon">🎉</div>
          <h1>Booking Confirmed!</h1>
          <p className="subtitle">Your booking has been confirmed successfully.</p>
          <div className="email-badge">
            📧 A confirmation email has been sent to <strong>{booking.guestEmail || booking.userEmail}</strong>
          </div>
        </div>

        {/* Booking ID */}
        <div className="booking-id-section">
          <span className="booking-id-label">Booking ID</span>
          <span className="booking-id-value">#{bookingId || booking.bookingId || 'N/A'}</span>
        </div>

        {/* Booking Details */}
        <div className="details-section">
          <h3>📋 Booking Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Room</span>
              <span className="value">{booking.roomName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Room Type</span>
              <span className="value">{booking.roomType === 'ac' ? '❄️ AC Room' : '🌬️ Non-AC Room'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Check-in</span>
              <span className="value">{booking.checkInDate} at {booking.checkInTime}</span>
            </div>
            <div className="detail-item">
              <span className="label">Check-out</span>
              <span className="value">{booking.checkOutDate} at {booking.checkOutTime}</span>
            </div>
            <div className="detail-item">
              <span className="label">Guests</span>
              <span className="value">{booking.guests || 1}</span>
            </div>
            <div className="detail-item">
              <span className="label">Total Days</span>
              <span className="value">{booking.totalDays || 1} days</span>
            </div>
            <div className="detail-item">
              <span className="label">Total Hours</span>
              <span className="value">{booking.totalHours || 24} hours</span>
            </div>
            <div className="detail-item highlight">
              <span className="label">Total Price</span>
              <span className="value">₹{booking.totalPrice}</span>
            </div>
            <div className="detail-item status-item">
              <span className="label">Status</span>
              <span className={`status-badge ${status || booking.status || 'confirmed'}`}>
                {status === 'pending' ? '⏳ Pending' : '✅ Confirmed'}
              </span>
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="details-section guest-details">
          <h3>👤 Guest Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Guest Name</span>
              <span className="value">{booking.guestName || booking.userName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Mobile</span>
              <span className="value">{booking.guestPhone}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email</span>
              <span className="value">{booking.guestEmail || booking.userEmail}</span>
            </div>
            <div className="detail-item full-width">
              <span className="label">Address</span>
              <span className="value">
                {booking.guestAddress || 'N/A'}
                {booking.guestCity && `, ${booking.guestCity}`}
                {booking.guestPincode && ` - ${booking.guestPincode}`}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Aadhar Number</span>
              <span className="value">******{booking.aadharNumber?.slice(-4) || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Aadhar Name</span>
              <span className="value">{booking.aadharName || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="instructions-section">
          <h3>📌 Important Instructions</h3>
          <ul className="instructions-list">
            <li>🪪 Please carry a valid ID proof (Aadhar/Driving License/Passport)</li>
            <li>⏰ Check-in time: <strong>{booking.checkInTime || '12:00'}</strong> | Check-out time: <strong>{booking.checkOutTime || '11:00'}</strong></li>
            <li>🕐 Early check-in subject to availability</li>
            <li>📄 Please present the original Aadhar card at check-in</li>
            <li>❌ Cancellation policy: Free cancellation up to 24 hours before check-in</li>
          </ul>
        </div>

        {/* Payment Details */}
        {paymentId && (
          <div className="payment-section">
            <h3>💳 Payment Details</h3>
            <div className="payment-details">
              <div className="payment-item">
                <span className="label">Payment ID</span>
                <span className="value">{paymentId}</span>
              </div>
              <div className="payment-item">
                <span className="label">Payment Status</span>
                <span className="payment-status success">✅ Completed</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/my-bookings" className="btn-my-bookings">
            📋 View My Bookings
          </Link>
          <Link to="/" className="btn-home">
            🏠 Back to Home
          </Link>
          <button className="btn-print" onClick={handlePrint} disabled={printing}>
            🖨️ {printing ? 'Printing...' : 'Print Confirmation'}
          </button>
        </div>

        {/* Footer */}
        <div className="success-footer">
          <p>📞 For any queries, contact us at <strong>+91 9108217506</strong></p>
          <p>🌐 <a href="https://www.lasyainnroom.com">www.lasyainnroom.com</a></p>
          <p className="footer-note">This is a system-generated confirmation. Please keep this for your records.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;