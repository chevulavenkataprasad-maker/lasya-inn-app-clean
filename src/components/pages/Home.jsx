// src/components/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRooms, cancelBooking, listenToUserBookings } from '../../firebase/firestore';
import toast from 'react-hot-toast';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [roomType, setRoomType] = useState('');
  const [rooms, setRooms] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  // ============================================
  // ✅ FETCH ROOMS
  // ============================================
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await getRooms();
      console.log('🏨 Rooms fetched:', roomsData.length);
      setRooms(roomsData || []);
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ REAL-TIME LISTENER FOR USER BOOKINGS
  // ============================================
  useEffect(() => {
    if (!user) {
      console.log('⚠️ No user, clearing bookings');
      setUserBookings([]);
      return;
    }

    console.log('👤 Setting up real-time listener for user:', user.uid);

    const unsubscribe = listenToUserBookings(user.uid, (bookings) => {
      console.log('📋 Real-time bookings update:', bookings);
      setUserBookings(bookings);
    });

    return () => {
      console.log('🔴 Unsubscribing from bookings listener');
      unsubscribe();
    };
  }, [user]);

  // ============================================
  // ✅ GET ACTIVE BOOKINGS
  // ============================================
  const getActiveBookings = () => {
    if (!user || userBookings.length === 0) return [];

    const active = userBookings.filter(booking => {
      const isUserBooking = booking.userId === user.uid;
      const isActive = booking.status === 'confirmed' || booking.status === 'pending';
      return isUserBooking && isActive;
    });

    console.log('✅ Active bookings:', active.length);
    return active;
  };

  // ============================================
  // ✅ GET CANCELLED BOOKINGS
  // ============================================
  const getCancelledBookings = () => {
    if (!user || userBookings.length === 0) return [];
    
    return userBookings.filter(booking => {
      const isUserBooking = booking.userId === user.uid;
      const isCancelled = booking.status === 'cancelled';
      return isUserBooking && isCancelled;
    });
  };

  // ============================================
  // ✅ GET AVAILABLE ROOMS
  // ============================================
  const getAvailableRooms = () => {
    return rooms.filter(room => {
      const available = room.availableRooms || room.totalRooms || 0;
      return available > 0;
    });
  };

  // ============================================
  // ✅ CANCEL BOOKING
  // ============================================
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        toast.success('✅ Booking cancelled successfully');
        // Listener will auto-update
      }
    } catch (error) {
      console.error('❌ Cancel error:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  // ============================================
  // ✅ RENDER BOOKED ROOMS
  // ============================================
  const renderBookedRooms = () => {
    const activeBookings = getActiveBookings();

    if (activeBookings.length === 0) {
      return (
        <div className="no-rooms-message">
          <p>📋 You have no active bookings</p>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '10px' }}>
            Book a room from Available Rooms tab
          </p>
        </div>
      );
    }

    return (
      <div className="rooms-grid">
        {activeBookings.map((booking) => {
          const room = rooms.find(r => r.id === booking.roomId);
          const roomName = booking.roomName || room?.name || 'Unknown Room';
          const roomPrice = booking.totalPrice || room?.price || 0;
          const status = booking.status || 'pending';
          
          return (
            <div key={booking.id} className="room-card booking-card">
              <div className="room-image">
                {room?.imageUrl ? (
                  <img 
                    src={room.imageUrl} 
                    alt={roomName}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '🛏️';
                    }}
                  />
                ) : (
                  <img 
                    src="/images/bed.jpeg" 
                    alt={roomName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                )}
                <span className={`room-badge ${status === 'confirmed' ? 'available' : 'booked'}`}>
                  {status === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}
                </span>
              </div>
              <h3>{roomName}</h3>
              <ul className="room-features">
                <li>📅 Check-in: {booking.checkInDate}</li>
                <li>📅 Check-out: {booking.checkOutDate}</li>
                <li>👤 {booking.guestName || 'Guest'}</li>
              </ul>
              <div className="booking-status">
                <span className={`status-badge ${status}`}>
                  {status === 'confirmed' ? '✅ Confirmed' : 
                   status === 'pending' ? '⏳ Pending' : status}
                </span>
              </div>
              <p className="room-price">₹{roomPrice} <span>Total</span></p>
              {status !== 'cancelled' && (
                <button 
                  className="btn-cancel-booking"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================
  // ✅ RENDER CANCELLED ROOMS
  // ============================================
  const renderCancelledRooms = () => {
    const cancelledBookings = getCancelledBookings();

    if (cancelledBookings.length === 0) {
      return (
        <div className="no-rooms-message">
          <p>❌ No cancelled bookings</p>
        </div>
      );
    }

    return (
      <div className="rooms-grid">
        {cancelledBookings.map((booking) => {
          const room = rooms.find(r => r.id === booking.roomId);
          const roomName = booking.roomName || room?.name || 'Unknown Room';
          const roomPrice = booking.totalPrice || room?.price || 0;
          
          return (
            <div key={booking.id} className="room-card booking-card">
              <div className="room-image">
                {room?.imageUrl ? (
                  <img 
                    src={room.imageUrl} 
                    alt={roomName}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '🛏️';
                    }}
                  />
                ) : (
                  <img 
                    src="/images/bed.jpeg" 
                    alt={roomName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                )}
                <span className="room-badge cancelled">
                  ❌ Cancelled
                </span>
              </div>
              <h3>{roomName}</h3>
              <ul className="room-features">
                <li>📅 Check-in: {booking.checkInDate}</li>
                <li>📅 Check-out: {booking.checkOutDate}</li>
                <li>👤 {booking.guestName || 'Guest'}</li>
              </ul>
              <div className="booking-status">
                <span className="status-badge cancelled">
                  ❌ Cancelled
                </span>
              </div>
              <p className="room-price">₹{roomPrice} <span>Total</span></p>
              <Link to={`/rooms`} className="btn-book">
                Book Again
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================
  // ✅ RENDER AVAILABLE ROOMS - 24 HOURS
  // ============================================
  const renderAvailableRooms = () => {
    const availableRooms = getAvailableRooms();

    if (availableRooms.length === 0) {
      return (
        <div className="no-rooms-message">
          <p>🚫 No rooms available at the moment</p>
          <p style={{ fontSize: '14px', color: '#888', marginTop: '10px' }}>
            Please check back later or contact admin
          </p>
        </div>
      );
    }

    return (
      <div className="rooms-grid">
        {availableRooms.map((room) => {
          const availableCount = room.availableRooms || room.totalRooms || 0;
          const isAvailable = availableCount > 0;
          
          return (
            <div key={room.id} className="room-card">
              <div className="room-image">
                {room.imageUrl ? (
                  <img 
                    src={room.imageUrl} 
                    alt={room.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '🛏️';
                    }}
                  />
                ) : (
                  <img 
                    src="/images/bed.jpeg" 
                    alt={room.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '🛏️';
                    }}
                  />
                )}
                <span className={`room-badge ${isAvailable ? 'available' : 'booked'}`}>
                  {isAvailable ? '✅ Available' : '❌ Booked'}
                </span>
              </div>
              <h3>{room.name}</h3>
              <ul className="room-features">
                <li>👥 {room.capacity || 2} Guests</li>
                <li>🛌 {room.beds || 1} {room.beds > 1 ? 'Beds' : 'Bed'}</li>
                {room.amenities && room.amenities.slice(0, 2).map((item, index) => (
                  <li key={index}>✓ {item}</li>
                ))}
                {room.amenities && room.amenities.length > 2 && (
                  <li>+{room.amenities.length - 2} more</li>
                )}
              </ul>
              <div className="room-availability-info">
                <span className={`availability-status ${isAvailable ? 'available' : 'booked'}`}>
                  {isAvailable ? '🟢' : '🔴'} {availableCount} rooms available
                </span>
              </div>
              {/* ✅ CHANGED: / Night → / 24 hours */}
              <p className="room-price">₹{room.price} <span>/ 24 hours</span></p>
              <Link 
                to={isAvailable ? `/booking/${room.id}` : '#'} 
                state={{ 
                  roomId: room.id,
                  roomName: room.name,
                  roomPrice: room.price,
                  roomType: room.type,
                  imageUrl: room.image
                }}
                className={`btn-book ${!isAvailable ? 'btn-booked' : ''}`}
                onClick={(e) => {
                  if (!isAvailable) {
                    e.preventDefault();
                    toast.error('Room is fully booked');
                  }
                }}
              >
                {isAvailable ? 'BOOK NOW' : 'FULLY BOOKED'}
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================
  // ✅ RENDER BASED ON TAB
  // ============================================
  const renderContent = () => {
    switch (activeTab) {
      case 'available':
        return renderAvailableRooms();
      case 'booked':
        return renderBookedRooms();
      case 'cancelled':
        return renderCancelledRooms();
      default:
        return renderAvailableRooms();
    }
  };

  const handleQuickBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { checkIn, checkOut, guests, roomType } });
  };

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>WELCOME TO</h1>
          <h2>LASYA INN ROOMS</h2>
          <p>Experience Comfort, Cleanliness & Affordable Luxury</p>
          <div className="hero-features">
            <span>🕐 24/7 Check-in</span>
            <span>📶 Free Wi-Fi</span>
            <span>💰 Best Price Guarantee</span>
          </div>
          <div className="hero-buttons">
            <Link to="/rooms" className="btn-primary">VIEW ROOMS</Link>
            <a href="tel:+919108217506" className="btn-secondary">CALL NOW</a>
          </div>
        </div>
      </section>

      {/* BOOKING WIDGET */}
      <section className="booking-widget">
        <div className="widget-container">
          <div className="widget-item">
            <label>CHECK-IN</label>
            <input 
              type="date" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="widget-item">
            <label>CHECK-OUT</label>
            <input 
              type="date" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          <div className="widget-item">
            <label>GUESTS</label>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests</option>
            </select>
          </div>
          <div className="widget-item">
            <label>ROOM TYPE</label>
            <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              <option value="">Select Room Type</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - ₹{room.price}
                </option>
              ))}
            </select>
          </div>
          <button 
            className="btn-check-availability"
            onClick={handleQuickBooking}
            disabled={!checkIn || !checkOut}
          >
            CHECK AVAILABILITY
          </button>
        </div>
      </section>

      {/* ROOMS SECTION */}
      <section className="rooms-section">
        <div className="rooms-tabs">
          <button 
            className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            🟢 Available Rooms
            <span className="tab-count">{getAvailableRooms().length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'booked' ? 'active' : ''}`}
            onClick={() => setActiveTab('booked')}
          >
            📋 My Bookings
            <span className="tab-count">{getActiveBookings().length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            ❌ Cancelled
            <span className="tab-count">{getCancelledBookings().length}</span>
          </button>
        </div>

        {loading ? (
          <div className="rooms-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div className="rooms-container">
            <div className="rooms-header">
              <h2>
                {activeTab === 'available' && '🟢 Available Rooms'}
                {activeTab === 'booked' && '📋 My Bookings'}
                {activeTab === 'cancelled' && '❌ Cancelled Bookings'}
              </h2>
              <div className="room-count">
                {activeTab === 'available' && `${getAvailableRooms().length} rooms`}
                {activeTab === 'booked' && `${getActiveBookings().length} bookings`}
                {activeTab === 'cancelled' && `${getCancelledBookings().length} bookings`}
              </div>
            </div>
            {renderContent()}
          </div>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-choose">
        <h2>WHY CHOOSE US?</h2>
        <div className="features-grid">
          <div className="feature">
            <span>🧹</span>
            <h4>Clean & Spacious Rooms</h4>
          </div>
          <div className="feature">
            <span>💰</span>
            <h4>Affordable Price</h4>
          </div>
          <div className="feature">
            <span>🕐</span>
            <h4>24/7 Customer Support</h4>
          </div>
          <div className="feature">
            <span>🔒</span>
            <h4>Secure & Safe Environment</h4>
          </div>
          <div className="feature">
            <span>📍</span>
            <h4>Prime Location</h4>
          </div>
        </div>
        
        <div className="benefits">
          <div className="benefit">
            <h3>Best Price Guarantee</h3>
            <p>Get the best price for your comfortable stay.</p>
          </div>
          <div className="benefit">
            <h3>Easy Booking</h3>
            <p>Book your room in just a few clicks.</p>
          </div>
          <div className="benefit">
            <h3>Instant Confirmation</h3>
            <p>Receive instant booking confirmation.</p>
          </div>
        </div>
        
        <Link to="/rooms" className="btn-direct-book">
          BOOK DIRECT & SAVE MORE
        </Link>
      </section>
    </div>
  );
};

export default Home;