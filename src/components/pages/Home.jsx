// src/components/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRooms, getUserBookings, cancelBooking } from '../../firebase/firestore';
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

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all rooms
      const roomsData = await getRooms();
      setRooms(roomsData || []);
      
      // Fetch user bookings if logged in
      if (user) {
        const bookingsData = await getUserBookings(user.uid);
        setUserBookings(bookingsData || []);
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { checkIn, checkOut, guests, roomType } });
  };

  // ============================================
  // CANCEL BOOKING
  // ============================================
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        toast.success('✅ Booking cancelled successfully');
        fetchData();
      }
    } catch (error) {
      console.error('❌ Cancel error:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  // ============================================
  // GET AVAILABLE ROOMS
  // ============================================
  const getAvailableRooms = () => {
    return rooms.filter(room => {
      const available = room.availableRooms || room.totalRooms || 0;
      return available > 0;
    });
  };

  // ============================================
  // GET BOOKED ROOMS
  // ============================================
  const getBookedRooms = () => {
    if (!user) return [];
    return userBookings.filter(booking => 
      booking.status === 'confirmed' || booking.status === 'pending'
    );
  };

  // ============================================
  // GET CANCELLED ROOMS
  // ============================================
  const getCancelledRooms = () => {
    if (!user) return [];
    return userBookings.filter(booking => 
      booking.status === 'cancelled'
    );
  };

  // ============================================
  // RENDER ROOMS BASED ON TAB
  // ============================================
  const renderRooms = () => {
    let roomsToShow = [];
    let title = '';
    let emptyMessage = '';

    switch (activeTab) {
      case 'available':
        roomsToShow = getAvailableRooms();
        title = '🟢 Available Rooms';
        emptyMessage = 'No rooms available at the moment';
        break;
      case 'booked':
        roomsToShow = getBookedRooms();
        title = '📋 My Bookings';
        emptyMessage = 'You have no active bookings';
        break;
      case 'cancelled':
        roomsToShow = getCancelledRooms();
        title = '❌ Cancelled Bookings';
        emptyMessage = 'No cancelled bookings';
        break;
      default:
        roomsToShow = [];
    }

    return (
      <div className="rooms-container">
        <div className="rooms-header">
          <h2>{title}</h2>
          <div className="room-count">
            {roomsToShow.length} {roomsToShow.length === 1 ? 'room' : 'rooms'}
          </div>
        </div>

        {roomsToShow.length === 0 ? (
          <div className="no-rooms-message">
            <p>{emptyMessage}</p>
            {activeTab === 'available' && (
              <Link to="/rooms" className="btn-view-all">VIEW ALL ROOMS →</Link>
            )}
          </div>
        ) : (
          <div className="rooms-grid">
            {roomsToShow.map((item) => {
              // Available rooms
              if (activeTab === 'available') {
                const room = item;
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
                    <p className="room-price">₹{room.price} <span>/ Night</span></p>
                    <Link 
                      to={isAvailable ? `/room/${room.id}` : '#'} 
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
              } 
              // Booked and Cancelled rooms
              else {
                const booking = item;
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
                      <span className={`room-badge ${status === 'cancelled' ? 'cancelled' : 'booked'}`}>
                        {status === 'cancelled' ? '❌ Cancelled' : '📋 Booked'}
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
                         status === 'pending' ? '⏳ Pending' : 
                         status === 'cancelled' ? '❌ Cancelled' : status}
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
                    {status === 'cancelled' && (
                      <Link to={`/rooms`} className="btn-book">
                        Book Again
                      </Link>
                    )}
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="home-page">
      
      {/* ========================================= */}
      {/* HERO SECTION */}
      {/* ========================================= */}
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
            <a href="tel:+911234567890" className="btn-secondary">CALL NOW</a>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* BOOKING WIDGET */}
      {/* ========================================= */}
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

      {/* ========================================= */}
      {/* ROOMS SECTION - Available, Booked, Cancelled */}
      {/* ========================================= */}
      <section className="rooms-section">
        {/* Tabs */}
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
            <span className="tab-count">{getBookedRooms().length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            ❌ Cancelled
            <span className="tab-count">{getCancelledRooms().length}</span>
          </button>
        </div>

        {/* Rooms Display */}
        {loading ? (
          <div className="rooms-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          renderRooms()
        )}
      </section>

      {/* ========================================= */}
      {/* WHY CHOOSE US */}
      {/* ========================================= */}
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