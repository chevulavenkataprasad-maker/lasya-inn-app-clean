// src/components/layout/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ============================================
  // ✅ REAL-TIME NOTIFICATION COUNT FOR USER
  // ============================================
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('target', '==', 'user'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
      console.log('🔔 Unread notifications:', snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  // ✅ Nav Links - REMOVED ROOMS
  const navLinks = [
    { path: '/', icon: '🏠', label: 'Home' },
    // { path: '/rooms', icon: '🛏️', label: 'Rooms' }, // ❌ Removed
    { path: '/amenities', icon: '✨', label: 'Amenities' },
    { path: '/gallery', icon: '📸', label: 'Gallery' },
    { path: '/reviews', icon: '⭐', label: 'Reviews' },
    { path: '/location', icon: '📍', label: 'Location' },
    { path: '/contact', icon: '📞', label: 'Contact' },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const adminEmails = ['test@gmail.com', 'admin@gmail.com', 'venkat@gmail.com'];
  const isAdmin = adminEmails.includes(user?.email);

  return (
    <nav className="navbar-pro">
      <div className="nav-container-pro">
        
        {/* Logo */}
        <div className="nav-logo-pro">
          <Link to="/">
            <div className="logo-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/images/admin-building.jpeg" 
                alt="Lasya Inn Logo"
                className="logo-image"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  marginRight: '12px',
                  border: '2px solid #f3f0f0'
                }}
              />
              <div className="logo-text-group">
                <span className="logo-text">LASYA INN ROOMS</span>
                <span className="logo-tagline">Comfort • Clean • Affordable Luxury</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Menu - WITHOUT ROOMS */}
        <div className="nav-menu-pro">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link-pro ${isActive(link.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="nav-actions-pro">
          {user ? (
            <>
              <div className="user-profile">
                <span className="user-avatar">👤</span>
                <span className="user-name">{user.displayName || 'User'}</span>
              </div>
              {isAdmin && (
                <Link to="/admin" className="nav-btn-pro admin-btn">
                  ⚙️ Admin
                </Link>
              )}
              {/* ✅ Notifications Bell with Badge */}
              <Link to="/notifications" className="nav-btn-pro notification-btn" style={{ position: 'relative' }}>
                🔔
                {unreadCount > 0 && (
                  <span className="nav-notification-badge" style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-8px',
                    background: '#f44336',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 7px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/booking" className="nav-btn-pro book-btn">
                📅 BOOK NOW
              </Link>
              <button onClick={handleLogout} className="nav-btn-pro logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/admin/login" className="nav-btn-pro admin-btn">
                🔐 Admin Login
              </Link>
              <Link to="/login" className="nav-btn-pro login-btn">
                🔑 Login
              </Link>
              <Link to="/register" className="nav-btn-pro register-btn">
                📝 Register
              </Link>
              <Link to="/booking" className="nav-btn-pro book-btn">
                📅 BOOK NOW
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle-pro" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu - WITHOUT ROOMS */}
      <div className={`mobile-menu-pro ${mobileMenu ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`mobile-link-pro ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => setMobileMenu(false)}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
        <div className="mobile-divider"></div>
        {user ? (
          <>
            <div className="mobile-user-info">
              <span>👤 {user.displayName || 'User'}</span>
            </div>
            {isAdmin && (
              <Link to="/admin" className="mobile-link-pro" onClick={() => setMobileMenu(false)}>
                ⚙️ Admin
              </Link>
            )}
            {/* ✅ Notifications in Mobile Menu */}
            <Link to="/notifications" className="mobile-link-pro" onClick={() => setMobileMenu(false)}>
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="mobile-notification-badge" style={{
                  background: '#f44336',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 8px',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/booking" className="mobile-link-pro book-link" onClick={() => setMobileMenu(false)}>
              📅 BOOK NOW
            </Link>
            <button onClick={handleLogout} className="mobile-logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/admin/login" className="mobile-link-pro" onClick={() => setMobileMenu(false)}>
              🔐 Admin Login
            </Link>
            <Link to="/login" className="mobile-link-pro" onClick={() => setMobileMenu(false)}>
              🔑 Login
            </Link>
            <Link to="/register" className="mobile-link-pro" onClick={() => setMobileMenu(false)}>
              📝 Register
            </Link>
            <Link to="/booking" className="mobile-link-pro book-link" onClick={() => setMobileMenu(false)}>
              📅 BOOK NOW
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;