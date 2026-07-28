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
  // ✅ DOWNLOAD AADHAR IMAGE - ADDED
  // ============================================
  const handleDownloadAadhar = (imageUrl, guestName) => {
    if (!imageUrl) {
      toast.error('No Aadhar image available');
      return;
    }

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `aadhar_${guestName || 'guest'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`📥 Downloading Aadhar for ${guestName || 'Guest'}`);
  };

  // ============================================
  // ✅ ADMIN ACCEPT BOOKING
  // ============================================
  const handleAcceptBooking = async (bookingId, bookingData) => {
    try {
      await updateBookingStatus(bookingId, 'confirmed');
      
      console.log('📋 Accepting booking:', bookingData);
      
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                        🪪 View
                      </button>
                      <button
                        onClick={() => handleDownloadAadhar(booking.aadharPhoto, booking.guestName)}
                        style={{
                          padding: '4px 10px',
                          background: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📥 Download
                      </button>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                        {booking.aadharNumber ? `****${booking.aadharNumber.slice(-4)}` : 'N/A'}
                      </div>
                    </div>
                  ) : (
                    <span className="no-aadhar" style={{ color: '#888', fontSize: '12px' }}>Not uploaded</span>
                  )}
                </td>
                
                {/* ✅ All Guests Aadhar - With Download Buttons */}
                <td>
                  <div className="guest-aadhar-list">
                    {booking.guestAadharDetails && booking.guestAadharDetails.length > 0 ? (
                      booking.guestAadharDetails.map((guest, index) => (
                        <div key={index} style={{ 
                          fontSize: '12px', 
                          color: '#555',
                          padding: '4px 0',
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}>
                          <span>Guest {index + 1}: ****{guest.aadharNumber?.slice(-4) || 'N/A'}</span>
                          {guest.aadharPhoto && (
                            <button
                              onClick={() => handleDownloadAadhar(guest.aadharPhoto, guest.name || `Guest ${index + 1}`)}
                              style={{
                                padding: '2px 8px',
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = '#45a049';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = '#4CAF50';
                              }}
                            >
                              📥 Download
                            </button>
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

      {selectedAadhar && (
        <div className="aadhar-popup-overlay" onClick={() => setSelectedAadhar(null)}>
          <div className="aadhar-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="aadhar-popup-close" onClick={() => setSelectedAadhar(null)}>✕</button>
            <img src={selectedAadhar} alt="Aadhar Card" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
            <p className="aadhar-popup-title">🪪 Aadhar Card</p>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = selectedAadhar;
                link.download = `aadhar_${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('📥 Downloading Aadhar...');
              }}
              style={{
                padding: '8px 20px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '10px'
              }}
            >
              📥 Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;