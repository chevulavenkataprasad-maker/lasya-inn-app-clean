// src/components/pages/MyBookings.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings } from '../../firebase/firestore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './MyBookings.css';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings(user.uid);
      setBookings(data || []);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="my-bookings-container">
        <div className="login-message">
          <h3>🔒 Please login to view your bookings</h3>
          <Link to="/login" className="btn-login">Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-bookings-container">
        <div className="loading-spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <h1>📋 My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You have no bookings yet.</p>
          <Link to="/rooms" className="btn-browse">Browse Rooms</Link>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <span className="booking-id">#{booking.id}</span>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status === 'confirmed' ? '✅ Confirmed' : 
                   booking.status === 'pending' ? '⏳ Pending' : 
                   booking.status === 'cancelled' ? '❌ Cancelled' : booking.status}
                </span>
              </div>
              <div className="booking-body">
                <h3>{booking.roomName}</h3>
                <p><strong>Guest:</strong> {booking.guestName}</p>
                <p><strong>Check-in:</strong> {booking.checkInDate} at {booking.checkInTime}</p>
                <p><strong>Check-out:</strong> {booking.checkOutDate} at {booking.checkOutTime}</p>
                <p><strong>Total:</strong> ₹{booking.totalPrice}</p>
              </div>
              <div className="booking-footer">
                <Link to={`/booking-details/${booking.id}`} className="btn-view">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;