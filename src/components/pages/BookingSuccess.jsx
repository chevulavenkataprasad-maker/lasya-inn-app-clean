import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BookingSuccess = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { bookingId, booking } = location.state || {};

  if (!booking) {
    return (
      <div className="page-container">
        <h1>Booking Not Found</h1>
        <Link to="/rooms" className="btn-primary">View Rooms</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="booking-success">
        <div className="success-icon">✅</div>
        <h1>🎉 Booking Confirmed!</h1>
        <p>Your booking has been confirmed successfully.</p>
        <p style={{ color: '#666' }}>A confirmation email has been sent to {booking.guestEmail}</p>

        <div className="booking-details">
          <h3>📋 Booking Details</h3>
          
          <div className="detail-row">
            <span>Booking ID:</span>
            <span style={{ color: '#ff6f00', fontWeight: 'bold' }}>#{bookingId}</span>
          </div>
          <div className="detail-row">
            <span>Room:</span>
            <span>{booking.roomName}</span>
          </div>
          <div className="detail-row">
            <span>Room Type:</span>
            <span>{booking.roomType === 'ac' ? '❄️ AC Room' : '🌬️ Non-AC Room'}</span>
          </div>
          
          <div className="detail-row">
            <span>Check-in:</span>
            <span>{booking.checkInDate} at {booking.checkInTime}</span>
          </div>
          <div className="detail-row">
            <span>Check-out:</span>
            <span>{booking.checkOutDate} at {booking.checkOutTime}</span>
          </div>
          
          <div className="detail-row">
            <span>Guests:</span>
            <span>{booking.guests}</span>
          </div>
          <div className="detail-row">
            <span>Guest Name:</span>
            <span>{booking.guestName}</span>
          </div>
          <div className="detail-row">
            <span>Mobile:</span>
            <span>{booking.guestPhone}</span>
          </div>
          <div className="detail-row">
            <span>Email:</span>
            <span>{booking.guestEmail}</span>
          </div>
          <div className="detail-row">
            <span>Address:</span>
            <span>{booking.guestAddress}, {booking.guestCity} - {booking.guestPincode}</span>
          </div>
          <div className="detail-row">
            <span>Aadhar Number:</span>
            <span>******{booking.aadharNumber?.slice(-4)}</span>
          </div>
          <div className="detail-row">
            <span>Aadhar Name:</span>
            <span>{booking.aadharName}</span>
          </div>
          <div className="detail-row">
            <span>Total Days:</span>
            <span>{booking.totalDays} days</span>
          </div>
          <div className="detail-row">
            <span>Total Price:</span>
            <span style={{ color: '#ff6f00', fontSize: '24px', fontWeight: 'bold' }}>
              ₹{booking.totalPrice}
            </span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span className="status-confirmed">✅ Confirmed</span>
          </div>
          {booking.specialRequests && (
            <div className="detail-row">
              <span>Special Requests:</span>
              <span>{booking.specialRequests}</span>
            </div>
          )}
        </div>

        <div className="booking-actions-success">
          <Link to="/my-bookings" className="btn-primary">
            📋 View My Bookings
          </Link>
          <Link to="/" className="btn-secondary">
            🏠 Back to Home
          </Link>
          <button 
            className="btn-print"
            onClick={() => window.print()}
          >
            🖨️ Print Confirmation
          </button>
        </div>

        <div className="booking-instructions">
          <h4>📌 Important Instructions:</h4>
          <ul>
            <li>Please carry a valid ID proof (Aadhar/Driving License/Passport)</li>
            <li>Check-in time: {booking.checkInTime} | Check-out time: {booking.checkOutTime}</li>
            <li>Early check-in subject to availability</li>
            <li>Please present the original Aadhar card at check-in</li>
            <li>Cancellation policy: Free cancellation up to 24 hours before check-in</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;