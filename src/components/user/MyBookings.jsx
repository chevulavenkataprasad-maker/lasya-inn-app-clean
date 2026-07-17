import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings } from '../../firebase/firestore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const data = await getUserBookings(user.uid);
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings yet</p>
          <Link to="/rooms" className="btn-primary">Book Now</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.roomName}</h3>
                <span className={getStatusColor(booking.status)}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-details-grid">
                <div>
                  <label>Check-in</label>
                  <p>{booking.checkIn}</p>
                </div>
                <div>
                  <label>Check-out</label>
                  <p>{booking.checkOut}</p>
                </div>
                <div>
                  <label>Guests</label>
                  <p>{booking.guests}</p>
                </div>
                <div>
                  <label>Total Price</label>
                  <p>₹{booking.totalPrice}</p>
                </div>
              </div>
              <div className="booking-actions">
                <span className="booking-date">
                  Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;