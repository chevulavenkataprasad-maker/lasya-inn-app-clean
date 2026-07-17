import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings } from '../../firebase/firestore';
import toast from 'react-hot-toast';

const AdminRevenue = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      const confirmed = data?.filter(b => b?.status === 'confirmed') || [];
      const revenue = confirmed.reduce((sum, b) => sum + (b?.totalPrice || 0), 0);
      setTotalRevenue(revenue);
      setBookings(confirmed);
    } catch (error) {
      toast.error('Failed to load revenue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-container">
        <div className="admin-header">
          <div>
            <h1>💰 Revenue Report</h1>
            <p>Total Revenue: ₹{totalRevenue.toLocaleString()}</p>
          </div>
          <Link to="/admin" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>
            ← Back
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="5">No confirmed bookings</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.guestName}</td>
                    <td>{booking.roomName}</td>
                    <td>{booking.checkInDate}</td>
                    <td>{booking.checkOutDate}</td>
                    <td>₹{booking.totalPrice}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;