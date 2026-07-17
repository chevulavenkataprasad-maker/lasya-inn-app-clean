import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRooms, getAllBookings, deleteBooking } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Check admin session
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    console.log('🔍 Admin Dashboard Check:');
    console.log('📌 isAdminLoggedIn:', isAdminLoggedIn);
    
    if (!isAdminLoggedIn) {
      console.log('❌ Redirecting to admin login');
      navigate('/admin/login');
      return;
    }
    
    console.log('✅ Admin logged in, fetching data');
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const rooms = await getRooms();
      const bookings = await getAllBookings();
      
      const pending = bookings?.filter(b => b?.status === 'pending') || [];
      const confirmed = bookings?.filter(b => b?.status === 'confirmed') || [];
      const cancelled = bookings?.filter(b => b?.status === 'cancelled') || [];
      const totalRevenue = confirmed.reduce((sum, b) => sum + (b?.totalPrice || 0), 0);
      
      setStats({
        totalRooms: rooms?.length || 0,
        totalBookings: bookings?.length || 0,
        pendingBookings: pending.length,
        confirmedBookings: confirmed.length,
        cancelledBookings: cancelled.length,
        totalRevenue: totalRevenue
      });
      setRecentBookings(bookings?.slice(0, 5) || []);
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  // ✅ DELETE BOOKING
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      toast.success('✅ Booking deleted successfully!');
      fetchStats(); // Refresh data
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error('Failed to delete booking');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-pro">
      
      {/* ========================================= */}
      {/* HEADER WITH BUILDING IMAGE */}
      {/* ========================================= */}
      <div className="dashboard-header-pro" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 30px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* Building Image */}
          <img 
            src="/images/admin-building.jpeg" 
            alt="Hotel Building"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '2px solid #e0e0e0'
            }}
          />
          
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>📊 Dashboard Overview</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              Welcome back, {user?.displayName || 'Admin'}!
            </p>
          </div>
        </div>
        
        <div className="header-actions-pro" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span className="date-badge-pro" style={{
            background: '#f5f5f5',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            📅 {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {/* ✅ Logout Button */}
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* STATS GRID - 6 Cards */}
      {/* ========================================= */}
      <div className="stats-grid-pro">
        <Link to="/admin/rooms" className="stat-item-pro stat-blue">
          <div className="stat-icon-pro">🏨</div>
          <div className="stat-info-pro">
            <span className="stat-number">{stats.totalRooms}</span>
            <span className="stat-label">Total Rooms</span>
          </div>
          <span className="stat-action">→</span>
        </Link>

        <Link to="/admin/bookings" className="stat-item-pro stat-purple">
          <div className="stat-icon-pro">📋</div>
          <div className="stat-info-pro">
            <span className="stat-number">{stats.totalBookings}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
          <span className="stat-action">→</span>
        </Link>

        <Link to="/admin/bookings?filter=pending" className="stat-item-pro stat-orange">
          <div className="stat-icon-pro">⏳</div>
          <div className="stat-info-pro">
            <span className="stat-number">{stats.pendingBookings}</span>
            <span className="stat-label">Pending</span>
          </div>
          <span className="stat-action">→</span>
        </Link>

        <Link to="/admin/bookings?filter=confirmed" className="stat-item-pro stat-green">
          <div className="stat-icon-pro">✅</div>
          <div className="stat-info-pro">
            <span className="stat-number">{stats.confirmedBookings}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <span className="stat-action">→</span>
        </Link>

        <Link to="/admin/bookings?filter=cancelled" className="stat-item-pro stat-red">
          <div className="stat-icon-pro">❌</div>
          <div className="stat-info-pro">
            <span className="stat-number">{stats.cancelledBookings}</span>
            <span className="stat-label">Cancelled</span>
          </div>
          <span className="stat-action">→</span>
        </Link>

        <Link to="/admin/bookings" className="stat-item-pro stat-gold">
          <div className="stat-icon-pro">💰</div>
          <div className="stat-info-pro">
            <span className="stat-number">₹{stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Revenue</span>
          </div>
          <span className="stat-action">→</span>
        </Link>
      </div>

      {/* ========================================= */}
      {/* QUICK ACTIONS - WITH GALLERY LINK */}
      {/* ========================================= */}
      <div className="quick-actions-pro">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-grid-pro">
          
          <Link to="/admin/rooms" className="action-card-pro">
            <div className="action-icon-pro">🛏️</div>
            <div className="action-info-pro">
              <h4>Manage Rooms</h4>
              <p>Add, edit, or delete rooms</p>
            </div>
          </Link>
          
          <Link to="/admin/bookings" className="action-card-pro">
            <div className="action-icon-pro">📋</div>
            <div className="action-info-pro">
              <h4>Manage Bookings</h4>
              <p>View and update bookings</p>
            </div>
          </Link>
          
          {/* ✅ Gallery Link */}
          <Link to="/gallery" className="action-card-pro">
            <div className="action-icon-pro">📸</div>
            <div className="action-info-pro">
              <h4>Manage Gallery</h4>
              <p>Upload and manage photos</p>
            </div>
          </Link>
          
        </div>
      </div>

      {/* ========================================= */}
      {/* RECENT BOOKINGS - WITH DELETE BUTTON */}
      {/* ========================================= */}
      <div className="recent-bookings-pro">
        <div className="recent-header-pro">
          <div className="recent-title-section">
            <span className="recent-icon">📋</span>
            <h3>Recent Bookings</h3>
            <span className="recent-count">{recentBookings.length} new</span>
          </div>
          <Link to="/admin/bookings" className="view-all-pro">
            View All →
          </Link>
        </div>
        
        {recentBookings.length === 0 ? (
          <div className="empty-state-pro">
            <span>📭</span>
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="recent-table-wrap-pro">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="guest-cell-pro">
                        <strong>{booking.guestName || booking.userName}</strong>
                        <span>📱 {booking.guestPhone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="room-cell-pro">
                        <span className="room-name">{booking.roomName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="dates-cell-pro">
                        <span className="date-in">📅 {booking.checkInDate}</span>
                        <span className="date-out">→ {booking.checkOutDate}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount-cell-pro">₹{booking.totalPrice}</span>
                    </td>
                    <td>
                      <span className={`status-badge-pro ${booking.status || 'pending'}`}>
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      {/* ✅ DELETE BUTTON */}
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="delete-btn-pro"
                        style={{
                          padding: '6px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'background 0.3s, transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#c82333';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#dc3545';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default AdminDashboard;