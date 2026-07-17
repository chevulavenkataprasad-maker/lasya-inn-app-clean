import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRoom } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [
    { id: 1, icon: '🛏️', label: 'Bedroom' },
    { id: 2, icon: '🛋️', label: 'Living Area' },
    { id: 3, icon: '🚿', label: 'Bathroom' },
    { id: 4, icon: '🌅', label: 'View' }
  ];

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const data = await getRoom(id);
      if (data) {
        setRoom(data);
      } else {
        // Demo data
        const demoRooms = {
          '1': { 
            id: '1', 
            name: 'Deluxe AC Room', 
            type: 'ac', 
            price: 2500, 
            guests: 2, 
            bed: '1 King Bed',
            image: '',
            description: 'Spacious deluxe room with air conditioning, premium bedding, and stunning garden view. Perfect for couples and business travelers.',
            amenities: ['Free Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar', 'Room Service', 'Work Desk', 'Premium Bedding', 'Garden View']
          },
          '2': { 
            id: '2', 
            name: 'Deluxe Non-AC Room', 
            type: 'non-ac', 
            price: 1500, 
            guests: 2, 
            bed: '1 King Bed',
            image: '',
            description: 'Comfortable deluxe room with fan, premium bedding, and garden view. Great value for money.',
            amenities: ['Free Wi-Fi', 'TV', 'Room Service', 'Work Desk', 'Premium Bedding', 'Garden View']
          }
        };
        setRoom(demoRooms[id] || null);
        if (!demoRooms[id]) {
          toast.error('Room not found');
          navigate('/rooms');
        }
      }
    } catch (error) {
      toast.error('Failed to load room');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (checkIn && checkOut) {
      const diff = new Date(checkOut) - new Date(checkIn);
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const handleBooking = () => {
    if (!user) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    navigate('/booking', { 
      state: { 
        roomId: id, 
        roomName: room.name,
        price: room.price,
        roomType: room.type,
        checkIn,
        checkOut,
        guests
      }
    });
  };

  if (loading) {
    return (
      <div className="room-details-loading">
        <div className="spinner-pro"></div>
        <p>Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return <div className="page-container">Room not found</div>;
  }

  const totalDays = calculateDays();
  const totalPrice = totalDays * room.price;

  return (
    <div className="room-details-page">
      <div className="room-details-container">
        {/* Back Button */}
        <Link to="/rooms" className="back-btn">
          ← Back to Rooms
        </Link>

        {/* Main Content */}
        <div className="room-details-main">
          {/* Left - Images */}
          <div className="room-details-images">
            <div className="room-main-image">
              {/* ✅ Display Room Image */}
              {room.image ? (
                <img 
                  src={room.image} 
                  alt={room.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span style="font-size:100px">🛏️</span>`;
                  }}
                />
              ) : (
                <span style={{ fontSize: '100px' }}>{images[selectedImage]?.icon || '🛏️'}</span>
              )}
            </div>
            <div className="room-thumbnails">
              {images.map((img, index) => (
                <div 
                  key={img.id}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <span>{img.icon}</span>
                  <span className="thumbnail-label">{img.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Details */}
          <div className="room-details-info">
            <div className="room-details-header">
              <div>
                <h1>{room.name}</h1>
                <span className="room-type-badge">
                  {room.type === 'ac' ? '❄️ AC Room' : '🌬️ Non-AC Room'}
                </span>
              </div>
              <div className="room-price-big">
                <span className="price">₹{room.price}</span>
                <span className="price-per">/ Night</span>
              </div>
            </div>

            <p className="room-description">{room.description}</p>

            {/* Features Grid */}
            <div className="features-grid-details">
              <div className="feature-item-details">
                <span>👥</span>
                <div>
                  <label>Guests</label>
                  <p>{room.guests}</p>
                </div>
              </div>
              <div className="feature-item-details">
                <span>🛌</span>
                <div>
                  <label>Bed</label>
                  <p>{room.bed}</p>
                </div>
              </div>
              <div className="feature-item-details">
                <span>📶</span>
                <div>
                  <label>Wi-Fi</label>
                  <p>Free</p>
                </div>
              </div>
              <div className="feature-item-details">
                <span>{room.type === 'ac' ? '❄️' : '🌬️'}</span>
                <div>
                  <label>Type</label>
                  <p>{room.type === 'ac' ? 'AC' : 'Non-AC'}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="amenities-list-details">
              <h3>✨ Amenities</h3>
              <div className="amenities-grid-details">
                {room.amenities && room.amenities.map((item, index) => (
                  <span key={index} className="amenity-tag-details">
                    ✅ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <div className="booking-form-details">
              <h3>📅 Book This Room</h3>
              <div className="booking-form-grid-details">
                <div className="form-group-details">
                  <label>Check-in <span className="required">*</span></label>
                  <input 
                    type="date" 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group-details">
                  <label>Check-out <span className="required">*</span></label>
                  <input 
                    type="date" 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group-details">
                  <label>Guests <span className="required">*</span></label>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              {totalDays > 0 && (
                <div className="booking-price-summary-details">
                  <div className="price-row-details">
                    <span>₹{room.price} × {totalDays} {totalDays === 1 ? 'night' : 'nights'}</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="price-row-details total">
                    <span>Total</span>
                    <span style={{ color: '#ff6f00', fontSize: '24px', fontWeight: 'bold' }}>
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>
              )}

              <button 
                onClick={handleBooking}
                className="btn-book-details"
                disabled={!checkIn || !checkOut}
              >
                {!checkIn || !checkOut ? 'Select Dates to Book' : 'Book Now'}
              </button>
              {(!checkIn || !checkOut) && (
                <p className="booking-hint-details">
                  Please select check-in and check-out dates
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;