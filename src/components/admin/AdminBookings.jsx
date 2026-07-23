// src/components/admin/AdminBookings.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { updateBookingStatus, deleteBooking, listenToAllBookings } from '../../firebase/firestore';
import { sendUserNotification, sendSMS } from '../../firebase/notificationService';
import toast from 'react-hot-toast';
import './AdminBookings.css';

const AdminBookings = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAadhar, setSelectedAadhar] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam && ['all', 'pending', 'confirmed', 'cancelled'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [location.search]);

  // ============================================
  // ✅ REAL-TIME LISTENER FOR ALL BOOKINGS
  // ============================================
  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = listenToAllBookings((data) => {
      console.log('📋 Real-time bookings update:', data);
      setBookings(data || []);
      setLoading(false);
    });

    return () => {
      console.log('🔴 Unsubscribing from all bookings');
      unsubscribe();
    };
  }, []);

  // ============================================
  // ✅ ADMIN ACCEPT BOOKING - Send User Notification
  // ============================================
  const handleAcceptBooking = async (bookingId, bookingData) => {
    try {
      // 1. Update booking status
      await updateBookingStatus(bookingId, 'confirmed');
      
      // 2. Send notification to user
      await sendUserNotification({
        bookingId: bookingId,
        userId: bookingData?.userId,
        guestName: bookingData?.guestName || 'Guest',
        guestPhone: bookingData?.guestPhone || 'N/A',
        roomName: bookingData?.roomName || 'Room',
        checkInDate: bookingData?.checkInDate || 'N/A',
        checkOutDate: bookingData?.checkOutDate || 'N/A',
        totalPrice: bookingData?.totalPrice || 0
      });

      // 3. Send SMS to user
      const smsMessage = `
🏨 Booking Confirmed! ✅

👤 Guest: ${bookingData?.guestName || 'Guest'}
🛏️ Room: ${bookingData?.roomName || 'Room'}
📅 Check-in: ${bookingData?.checkInDate || 'N/A'}
📅 Check-out: ${bookingData?.checkOutDate || 'N/A'}
💰 Total: ₹${bookingData?.totalPrice || 0}

✅ Your booking has been confirmed!
Thank you for choosing us! 🙏
      `.trim();

      await sendSMS(bookingData?.guestPhone, smsMessage);
      
      toast.success(
        (t) => (
          <div>
            <div><strong>✅ Booking Confirmed!</strong></div>
            <div>👤 {bookingData?.guestName || 'Guest'}</div>
            <div>📱 SMS sent to {bookingData?.guestPhone || 'N/A'}</div>
          </div>
        ),
        { duration: 5000 }
      );
      
    } catch (error) {
      console.error('❌ Accept error:', error);
      toast.error('Failed to accept booking');
    }
  };

  // ============================================
  // ✅ ADMIN CANCEL BOOKING - Send User Notification
  // ============================================
  const handleCancelBooking = async (bookingId, bookingData) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      // 1. Update booking status
      await updateBookingStatus(bookingId, 'cancelled');
      
      // 2. Send cancellation notification to user
      await sendUserNotification({
        bookingId: bookingId,
        userId: bookingData?.userId,
        guestName: bookingData?.guestName || 'Guest',
        guestPhone: bookingData?.guestPhone || 'N/A',
        roomName: bookingData?.roomName || 'Room',
        checkInDate: bookingData?.checkInDate || 'N/A',
        checkOutDate: bookingData?.checkOutDate || 'N/A',
        totalPrice: bookingData?.totalPrice || 0,
        type: 'booking_cancelled'
      });

      // 3. Send cancellation SMS to user
      const smsMessage = `
❌ Booking Cancelled

👤 Guest: ${bookingData?.guestName || 'Guest'}
🛏️ Room: ${bookingData?.roomName || 'Room'}
📅 Check-in: ${bookingData?.checkInDate || 'N/A'}

Your booking has been cancelled.
For any queries, please contact us. 🙏
      `.trim();

      await sendSMS(bookingData?.guestPhone, smsMessage);
      
      toast.error(
        (t) => (
          <div>
            <div><strong>❌ Booking Cancelled</strong></div>
            <div>👤 {bookingData?.guestName || 'Guest'}</div>
            <div>📱 SMS sent to {bookingData?.guestPhone || 'N/A'}</div>
          </div>
        ),
        { duration: 4000 }
      );
      
    } catch (error) {
      console.error('❌ Cancel error:', error);
      toast.error('Failed to cancel booking');
    }
  };

  // ============================================
  // ✅ DELETE BOOKING
  // ============================================
  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      toast.success('✅ Booking deleted successfully!');
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error('Failed to delete booking');
    }
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b?.status === filter);

  if (loading) {
    return (
      <div className="admin-loading-pro">
        <div className="spinner-pro"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-bookings-pro">
      <div className="admin-header-pro">
        <div>
          <h1>📋 Manage Bookings</h1>
          <p>View and update all bookings</p>
          <span className="room-count-pro">{bookings.length} bookings</span>
        </div>
        <Link to="/admin" className="btn-back-pro">← Back</Link>
      </div>

      <div className="filter-section-pro">
        {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'filter-active-pro' : 'filter-btn-pro'}
            onClick={() => {
              setFilter(f);
              window.location.href = `/admin/bookings${f !== 'all' ? `?filter=${f}` : ''}`;
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({bookings.filter(b => b?.status === f).length})
          </button>
        ))}
      </div>

      <div className="admin-table-pro">
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Amount</th>
              <th>Aadhar</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>
                  <div className="guest-cell-pro">
                    <strong>{booking.guestName || booking.userName}</strong>
                    <span>{booking.guestPhone}</span>
                    <small>{booking.guestEmail}</small>
                  </div>
                </td>
                <td>{booking.roomName}</td>
                <td>
                  {booking.checkInDate}<br /><small>⏰ {booking.checkInTime}</small>
                </td>
                <td>
                  {booking.checkOutDate}<br /><small>⏰ {booking.checkOutTime}</small>
                </td>
                <td>₹{booking.totalPrice}</td>
                <td>
                  {booking.aadharPhoto ? (
                    <button className="btn-aadhar-pro" onClick={() => setSelectedAadhar(booking.aadharPhoto)}>🪪 View</button>
                  ) : (
                    <span className="no-aadhar">Not uploaded</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge-pro ${booking.status || 'pending'}`}>
                    {booking.status || 'pending'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="btn-confirm-pro" 
                          onClick={() => handleAcceptBooking(booking.id, booking)}
                          title="Confirm Booking"
                        >
                          ✅ Accept
                        </button>
                        <button 
                          className="btn-cancel-pro" 
                          onClick={() => handleCancelBooking(booking.id, booking)}
                          title="Cancel Booking"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <>
                        <span className="confirmed-badge">✅ Confirmed</span>
                        <button 
                          className="btn-cancel-pro" 
                          onClick={() => handleCancelBooking(booking.id, booking)}
                          title="Cancel Booking"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'cancelled' && (
                      <span className="cancelled-badge">❌ Cancelled</span>
                    )}
                    
                    <button 
                      className="btn-delete-pro" 
                      onClick={() => handleDelete(booking.id)}
                      title="Delete Booking"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAadhar && (
        <div className="aadhar-popup-overlay" onClick={() => setSelectedAadhar(null)}>
          <div className="aadhar-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="aadhar-popup-close" onClick={() => setSelectedAadhar(null)}>✕</button>
            <img src={selectedAadhar} alt="Aadhar Card" />
            <p className="aadhar-popup-title">🪪 Aadhar Card</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;