// src/components/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRooms } from '../../firebase/firestore';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      console.log('🏨 Rooms fetched:', data);
      setRooms(data || []);
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to load rooms');
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
      {/* OUR ROOMS & SUITES - WITH AVAILABLE ROOMS, BOOKING, CANCEL */}
      {/* ========================================= */}
      <section className="rooms-section">
        <h2>OUR ROOMS & SUITES</h2>
        <p className="subtitle">Comfortable Rooms for Relaxing Stay</p>
        
        {loading ? (
          <div className="rooms-loading">
            <div className="spinner"></div>
            <p>Loading rooms...</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.length === 0 ? (
              <div className="no-rooms-message">
                <p>No rooms available yet. Check back soon!</p>
              </div>
            ) : (
              rooms.map((room) => {
                // Calculate available rooms (mock - replace with actual logic)
                const availableRooms = room.availableRooms || room.totalRooms || 5;
                const isAvailable = availableRooms > 0;
                
                return (
                  <div key={room.id} className="room-card">
                    <div className="room-image">
                      {room.imageUrl ? (
                        <img 
                          src={room.imageUrl} 
                          alt={room.name}
                          loading="lazy"
                          onError={(e) => {
                            console.log('❌ Image error:', room.imageUrl);
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
                            console.log('❌ Default image error');
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
                        {isAvailable ? '🟢' : '🔴'} {availableRooms} rooms available
                      </span>
                    </div>
                    <p className="room-price">₹{room.price} <span>/ Night</span></p>
                    <Link 
                      to={isAvailable ? `/room/${room.id}` : '#'} 
                      className={`btn-book ${!isAvailable ? 'btn-booked' : ''}`}
                      onClick={(e) => {
                        if (!isAvailable) {
                          e.preventDefault();
                          toast.error('Room is fully booked for these dates');
                        }
                      }}
                    >
                      {isAvailable ? 'VIEW DETAILS' : 'BOOKED'}
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        )}
        
        <Link to="/rooms" className="btn-view-all">VIEW ALL ROOMS →</Link>
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