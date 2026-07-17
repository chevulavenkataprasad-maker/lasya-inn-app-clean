import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../firebase/firestore';
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
    fetchBookings();
  }, [location.search]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`✅ Booking ${status}!`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  // ✅ DELETE BOOKING
  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      toast.success('✅ Booking deleted successfully!');
      fetchBookings();
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
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          title="Confirm"
                        >
                          ✅
                        </button>
                        <button 
                          className="btn-cancel-pro" 
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          title="Cancel"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        className="btn-cancel-pro" 
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        title="Cancel"
                      >
                        ❌
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <span className="no-action">No actions</span>
                    )}
                    {/* ✅ DELETE BUTTON - FOR ALL STATUS */}
                    <button 
                      className="btn-delete-pro" 
                      onClick={() => handleDelete(booking.id)}
                      title="Delete Booking"
                    >
                      🗑️
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