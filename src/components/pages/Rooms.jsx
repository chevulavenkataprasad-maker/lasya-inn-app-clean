import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRooms } from '../../firebase/firestore';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      if (data && data.length > 0) {
        setRooms(data);
      } else {
        setRooms([
          { id: '1', name: 'Deluxe AC Room', type: 'ac', price: 1200, guests: 2, bed: '1 King Bed', image: '' },
          { id: '2', name: 'Deluxe Non-AC Room', type: 'non-ac', price: 800, guests: 2, bed: '1 King Bed', image: '' },
          { id: '3', name: 'Executive Suite AC', type: 'ac', price: 2500, guests: 3, bed: '1 King Bed + Sofa', image: '' },
          { id: '4', name: 'Family Room AC', type: 'ac', price: 1800, guests: 4, bed: '2 King Beds', image: '' }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = filter === 'all' ? rooms : rooms.filter(r => r.type === filter);

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
      <div className="rooms-hero-pro">
        <h1>🏨 Our Rooms & Suites</h1>
        <p>Comfortable rooms for relaxing stay</p>
      </div>

      <div className="rooms-container-pro">
        <div className="rooms-filters-pro">
          <button className={filter === 'all' ? 'filter-active-pro' : 'filter-btn-pro'} onClick={() => setFilter('all')}>All Rooms</button>
          <button className={filter === 'ac' ? 'filter-active-pro' : 'filter-btn-pro'} onClick={() => setFilter('ac')}>❄️ AC Rooms</button>
          <button className={filter === 'non-ac' ? 'filter-active-pro' : 'filter-btn-pro'} onClick={() => setFilter('non-ac')}>🌬️ Non-AC</button>
        </div>

        <div className="rooms-grid-pro">
          {filteredRooms.map((room) => (
            <div key={room.id} className="room-card-pro">
              <div className="room-image-pro">
                {room.image ? (
                  <img src={room.image} alt={room.name} />
                ) : (
                  <span>🛏️</span>
                )}
              </div>
              <div className="room-badge-pro">{room.type === 'ac' ? '❄️ AC' : '🌬️ Non-AC'}</div>
              <h3>{room.name}</h3>
              <p>{room.description || 'Comfortable room with all amenities.'}</p>
              <ul>
                <li>👥 {room.guests} Guests</li>
                <li>🛌 {room.bed}</li>
                <li>📶 Free Wi-Fi</li>
              </ul>
              <div className="room-price-pro">₹{room.price} <span>/ 24hrs</span></div>
              <Link to={`/room/${room.id}`} className="btn-room-pro">VIEW DETAILS</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rooms;