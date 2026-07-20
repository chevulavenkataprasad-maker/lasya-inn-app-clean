// src/components/pages/Rooms.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRooms } from '../../firebase/firestore';
import toast from 'react-hot-toast';
import './Rooms.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'AC', 'Non-AC', 'Deluxe', 'Suite', 'Standard'];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      console.log('🏨 Rooms fetched:', data);
      
      if (data && data.length > 0) {
        setRooms(data);
      } else {
        // Demo rooms
        setRooms([
          { 
            id: '1', 
            name: 'Deluxe AC Room', 
            type: 'AC', 
            price: 1200, 
            capacity: 2, 
            beds: 1, 
            description: 'Luxurious AC room with king bed and modern amenities.',
            amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
            imageUrl: ''
          },
          { 
            id: '2', 
            name: 'Deluxe Non-AC Room', 
            type: 'Non-AC', 
            price: 800, 
            capacity: 2, 
            beds: 1, 
            description: 'Comfortable non-AC room with all basic amenities.',
            amenities: ['WiFi', 'TV', 'Fan'],
            imageUrl: ''
          },
          { 
            id: '3', 
            name: 'Executive Suite', 
            type: 'Suite', 
            price: 2500, 
            capacity: 3, 
            beds: 2, 
            description: 'Spacious suite with separate living area and premium amenities.',
            amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'],
            imageUrl: ''
          },
          { 
            id: '4', 
            name: 'Standard AC Room', 
            type: 'Standard', 
            price: 1500, 
            capacity: 2, 
            beds: 1, 
            description: 'Standard AC room with comfortable bedding.',
            amenities: ['WiFi', 'TV', 'AC'],
            imageUrl: ''
          }
        ]);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms based on category
  const filteredRooms = activeCategory === 'All' 
    ? rooms 
    : rooms.filter(room => room.type === activeCategory);

  if (loading) {
    return (
      <div className="rooms-loading-pro">
        <div className="spinner-pro"></div>
        <p>Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="rooms-page-pro">
      
      {/* ========================================= */}
      {/* HERO WITH BACKGROUND IMAGE */}
      {/* ========================================= */}
      <div className="rooms-hero-pro">
        <div className="rooms-hero-content">
          <h1>🛏️ Our Rooms</h1>
          <p>Comfortable rooms for your relaxing stay</p>
        </div>
      </div>

      {/* ========================================= */}
      {/* CATEGORY FILTERS */}
      {/* ========================================= */}
      <div className="rooms-filters-pro">
        {categories.map(cat => (
          <button
            key={cat}
            className={activeCategory === cat ? 'filter-active-pro' : 'filter-btn-pro'}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ========================================= */}
      {/* ROOMS GRID */}
      {/* ========================================= */}
      <div className="rooms-grid-pro">
        {filteredRooms.length === 0 ? (
          <div className="no-rooms-pro">
            <p>No rooms available</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div key={room.id} className="room-card-pro">
              <div className="room-image-pro">
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
                  <span>🛏️</span>
                )}
                <span className="room-badge-pro">{room.type || 'Standard'}</span>
              </div>
              <div className="room-info-pro">
                <h3>{room.name}</h3>
                <p>{room.description || 'Comfortable room for your stay'}</p>
                <ul className="room-features-pro">
                  <li>👥 {room.capacity || 2} Guests</li>
                  <li>🛌 {room.beds || 1} {room.beds > 1 ? 'Beds' : 'Bed'}</li>
                  {room.amenities && room.amenities.slice(0, 3).map((item, index) => (
                    <li key={index}>✓ {item}</li>
                  ))}
                  {room.amenities && room.amenities.length > 3 && (
                    <li>+{room.amenities.length - 3} more</li>
                  )}
                </ul>
                <p className="room-price-pro">₹{room.price} <span>/ night</span></p>
                <Link to={`/room/${room.id}`} className="btn-room-pro">
                  View Details →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Rooms;