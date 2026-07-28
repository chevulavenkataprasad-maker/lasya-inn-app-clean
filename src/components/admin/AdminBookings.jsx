// src/components/admin/AdminBookings.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { updateBookingStatus, deleteBooking, listenToAllBookings } from '../../firebase/firestore';
import { sendUserNotification } from '../../firebase/notificationService';
import { sendUserEmail } from '../../services/emailService';
import toast from 'react-hot-toast';
import './AdminBookings.css';

const AdminBookings = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAadhar, setSelectedAadhar] = useState(null);
  const [showFullAadhar, setShowFullAadhar] = useState(false); // ✅ New state for toggling full Aadhar visibility

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam && ['all', 'pending', 'confirmed', 'cancelled'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [location.search]);

  // Real-time listener
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
  // ✅ ADMIN ACCEPT BOOKING
  // ============================================
  const handleAcceptBooking = async (bookingId, bookingData) => {
    try {
      // 1. Update booking status
      await updateBookingStatus(bookingId, 'confirmed');
      
      console.log('📋 ===== ACCEPT BOOKING =====');
      console.log('📋 Booking ID:', bookingId);
      console.log('📋 Booking Data:', bookingData);
      console.log('📧 Guest Email:', bookingData?.guestEmail);
      
      // 2. Send In-App notification
      if (bookingData?.userId) {
        await sendUserNotification({
          bookingId: bookingId,
          userId: bookingData.userId,
          guestName: bookingData?.guestName || 'Guest',
          guestPhone: bookingData?.guestPhone || 'N/A',
          roomName: bookingData?.roomName || 'Room',
          checkInDate: bookingData?.checkInDate || 'N/A',
          checkOutDate: bookingData?.checkOutDate || 'N/A',
          totalPrice: bookingData?.totalPrice || 0
        });
        console.log('✅ In-app notification sent');
      }

      // 3. Send Email to user
      const guestEmail = bookingData?.guestEmail;
      if (guestEmail && guestEmail.trim() !== '') {
        const cleanEmail = guestEmail.trim();
        console.log('📧 Sending email to:', cleanEmail);
        
        const emailResult = await sendUserEmail({
          bookingId: bookingId,
          guestEmail: cleanEmail,
          guestName: bookingData?.guestName || 'Guest',
          guestPhone: bookingData?.guestPhone || 'N/A',
          roomName: bookingData?.roomName || 'Room',
          checkInDate: bookingData?.checkInDate || 'N/A',
          checkInTime: bookingData?.checkInTime || 'N/A',
          checkOutDate: bookingData?.checkOutDate || 'N/A',
          checkOutTime: bookingData?.checkOutTime || 'N/A',
          totalHours: bookingData?.totalHours || 24,
          totalPrice: bookingData?.totalPrice || 0
        });

        if (emailResult.success) {
          console.log('✅ Email sent to:', cleanEmail);
          toast.success(`✅ Email sent to ${cleanEmail}`);
        } else {
          console.error('❌ Email failed:', emailResult.error);
          toast.warning('Booking confirmed but email failed');
        }
      } else {
        console.warn('⚠️ No valid guestEmail found');
      }
      
      toast.success(
        (t) => (
          <div>
            <div><strong>✅ Booking Confirmed!</strong></div>
            <div>👤 {bookingData?.guestName || 'Guest'}</div>
            <div>📱 {bookingData?.guestPhone || 'N/A'}</div>
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
  // ✅ ADMIN CANCEL BOOKING
  // ============================================
  const handleCancelBooking = async (bookingId, bookingData) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await updateBookingStatus(bookingId, 'cancelled');
      
      if (bookingData?.userId) {
        await sendUserNotification({
          bookingId: bookingId,
          userId: bookingData.userId,
          guestName: bookingData?.guestName || 'Guest',
          guestPhone: bookingData?.guestPhone || 'N/A',
          roomName: bookingData?.roomName || 'Room',
          checkInDate: bookingData?.checkInDate || 'N/A',
          checkOutDate: bookingData?.checkOutDate || 'N/A',
          totalPrice: bookingData?.totalPrice || 0,
          type: 'booking_cancelled'
        });
        console.log('✅ Cancellation notification sent');
      }
      
      toast.error(
        (t) => (
          <div>
            <div><strong>❌ Booking Cancelled</strong></div>
            <div>👤 {bookingData?.guestName || 'Guest'}</div>
          </div>
        ),
        { duration: 4000 }
      );
      
    } catch (error) {
      console.error('❌ Cancel error:', error);
      toast.error('Failed to cancel booking');
    }
  };

  // DELETE BOOKING
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

  // ✅ Function to format Aadhar with spaces (XXXX XXXX XXXX)
  const formatAadhar = (number) => {
    if (!number) return 'N/A';
    const str = String(number).replace(/\s/g, '');
    if (str.length === 12) {
      return `${str.slice(0, 4)} ${str.slice(4, 8)} ${str.slice(8, 12)}`;
    }
    return str;
  };

  // ✅ Function to mask Aadhar (XXXX XXXX 1234)
  const maskAadhar = (number) => {
    if (!number) return 'N/A';
    const str = String(number).replace(/\s/g, '');
    if (str.length === 12) {
      return `XXXX XXXX ${str.slice(8, 12)}`;
    }
    return str;
  };

  // ✅ Get display value for Aadhar based on visibility toggle
  const getDisplayAadhar = (number) => {
    if (!number) return 'N/A';
    return showFullAadhar ? formatAadhar(number) : maskAadhar(number);
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* ✅ Toggle Button for Full Aadhar Visibility */}
          <button
            onClick={() => setShowFullAadhar(!showFullAadhar)}
            style={{
              padding: '8px 16px',
              background: showFullAadhar ? '#ff4444' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {showFullAadhar ? '🔒 Hide Full Aadhar' : '🔓 Show Full Aadhar'}
          </button>
          <Link to="/admin" className="btn-back-pro">← Back</Link>
        </div>
      </div>

      {/* ✅ Warning Banner when Full Aadhar is visible */}
      {showFullAadhar && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '12px 20px',
          marginBottom: '20px',
          color: '#856404'
        }}>
          ⚠️ <strong>Security Warning:</strong> Full Aadhar numbers are visible. 
          Ensure you are in a secure environment. Only authorized personnel should view this data.
          <button
            onClick={() => setShowFullAadhar(false)}
            style={{
              marginLeft: '15px',
              padding: '4px 12px',
              background: '#ffc107',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Hide Now
          </button>
        </div>
      )}

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

      <div className="admin-table-pro" style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '1200px' }}>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Contact</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Amount</th>
              <th>Aadhar</th>
              <th>All Guests Aadhar</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                {/* Guest Name */}
                <td>
                  <div className="guest-cell-pro">
                    <strong>{booking.guestName || booking.userName}</strong>
                    <small style={{ display: 'block', color: '#888', fontSize: '11px' }}>
                      {booking.guestEmail || booking.userEmail || 'N/A'}
                    </small>
                  </div>
                </td>
                
                {/* Contact */}
                <td>
                  <div className="contact-cell-pro">
                    <div>📧 {booking.guestEmail || booking.userEmail || 'N/A'}</div>
                    <div>📱 {booking.guestPhone || 'N/A'}</div>
                  </div>
                </td>
                
                {/* Room */}
                <td>
                  <div className="room-cell-pro">
                    <span className="room-name">{booking.roomName}</span>
                    <span className="room-type" style={{ fontSize: '11px', color: '#888', display: 'block' }}>
                      {booking.roomType === 'ac' ? '❄️ AC' : '🌬️ Non-AC'}
                    </span>
                  </div>
                </td>
                
                {/* Check-in */}
                <td>
                  <div className="dates-cell-pro">
                    <span className="date-in">📅 {booking.checkInDate}</span>
                    <span className="time-in" style={{ fontSize: '11px', color: '#888', display: 'block' }}>
                      ⏰ {booking.checkInTime}
                    </span>
                  </div>
                </td>
                
                {/* Check-out */}
                <td>
                  <div className="dates-cell-pro">
                    <span className="date-out">📅 {booking.checkOutDate}</span>
                    <span className="time-out" style={{ fontSize: '11px', color: '#888', display: 'block' }}>
                      ⏰ {booking.checkOutTime}
                    </span>
                  </div>
                </td>
                
                {/* Amount */}
                <td>
                  <span className="amount-cell-pro">₹{booking.totalPrice}</span>
                  <span className="days-cell" style={{ fontSize: '11px', color: '#888', display: 'block' }}>
                    {booking.totalDays || 1} days
                  </span>
                </td>
                
                {/* Primary Guest Aadhar */}
                <td>
                  {booking.aadharPhoto ? (
                    <button 
                      className="btn-aadhar-pro" 
                      onClick={() => setSelectedAadhar(booking.aadharPhoto)}
                      style={{
                        padding: '4px 10px',
                        background: '#f0c040',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🪪 View Image
                    </button>
                  ) : (
                    <span className="no-aadhar" style={{ color: '#888', fontSize: '12px' }}>Not uploaded</span>
                  )}
                  <div style={{ fontSize: '11px', color: '#555', marginTop: '2px', fontWeight: 'bold' }}>
                    {booking.aadharNumber ? getDisplayAadhar(booking.aadharNumber) : 'N/A'}
                  </div>
                </td>
                
                {/* ✅ All Guests Aadhar Numbers - NOW SHOWING FULL AADHAR */}
                <td>
                  <div className="guest-aadhar-list" style={{ minWidth: '150px' }}>
                    {booking.guestAadharNumbers && booking.guestAadharNumbers.length > 0 ? (
                      booking.guestAadharNumbers.map((aadhar, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            fontSize: '13px', 
                            color: '#222',
                            fontWeight: showFullAadhar ? 'bold' : 'normal',
                            padding: '2px 0',
                            borderBottom: index < booking.guestAadharNumbers.length - 1 ? '1px solid #eee' : 'none'
                          }}
                        >
                          👤 Guest {index + 1}: 
                          <span style={{ 
                            fontFamily: 'monospace', 
                            background: showFullAadhar ? '#e8f5e9' : '#f5f5f5',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '4px'
                          }}>
                            {getDisplayAadhar(aadhar)}
                          </span>
                          {showFullAadhar && (
                            <span style={{ 
                              fontSize: '10px', 
                              color: '#4CAF50', 
                              marginLeft: '6px',
                              fontWeight: 'bold'
                            }}>
                              ✅ Full
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="no-aadhar" style={{ color: '#888', fontSize: '12px' }}>N/A</span>
                    )}
                  </div>
                </td>
                
                {/* Status */}
                <td>
                  <span className={`status-badge-pro ${booking.status || 'pending'}`}>
                    {booking.status || 'pending'}
                  </span>
                </td>
                
                {/* Actions */}
                <td>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="btn-confirm-pro" 
                          onClick={() => handleAcceptBooking(booking.id, booking)}
                          title="Confirm Booking"
                          style={{
                            padding: '4px 10px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ✅ Accept
                        </button>
                        <button 
                          className="btn-cancel-pro" 
                          onClick={() => handleCancelBooking(booking.id, booking)}
                          title="Cancel Booking"
                          style={{
                            padding: '4px 10px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <>
                        <span className="confirmed-badge" style={{ color: '#4CAF50', fontSize: '12px' }}>✅ Confirmed</span>
                        <button 
                          className="btn-cancel-pro" 
                          onClick={() => handleCancelBooking(booking.id, booking)}
                          title="Cancel Booking"
                          style={{
                            padding: '4px 10px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'cancelled' && (
                      <span className="cancelled-badge" style={{ color: '#f44336', fontSize: '12px' }}>❌ Cancelled</span>
                    )}
                    
                    <button 
                      className="btn-delete-pro" 
                      onClick={() => handleDelete(booking.id)}
                      title="Delete Booking"
                      style={{
                        padding: '4px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
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

      {/* Aadhar Image Popup */}
      {selectedAadhar && (
        <div className="aadhar-popup-overlay" onClick={() => setSelectedAadhar(null)}>
          <div className="aadhar-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="aadhar-popup-close" onClick={() => setSelectedAadhar(null)}>✕</button>
            <img src={selectedAadhar} alt="Aadhar Card" />
            <p className="aadhar-popup-title">🪪 Aadhar Card</p>
          </div>
        </div>
      )}

      {/* ✅ Footer with Security Note */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666',
        fontSize: '13px',
        border: '1px solid #dee2e6'
      }}>
        <p>
          <strong>🔒 Security Note:</strong> 
          {showFullAadhar ? (
            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
              ⚠️ Full Aadhar numbers are currently visible. Only authorized admin personnel should view this data.
            </span>
          ) : (
            <span style={{ color: '#28a745' }}>
              ✅ Aadhar numbers are masked for security. Click "Show Full Aadhar" to view complete numbers.
            </span>
          )}
        </p>
        <p style={{ fontSize: '12px', marginTop: '5px', color: '#888' }}>
          All Aadhar data is stored securely in compliance with Indian data protection laws.
        </p>
      </div>
    </div>
  );
};

export default AdminBookings;