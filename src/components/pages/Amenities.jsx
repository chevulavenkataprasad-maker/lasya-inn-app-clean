import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Amenities = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const amenities = [
    { id: 1, category: 'room', icon: '❄️', name: 'Air Conditioning', desc: 'Premium AC units for perfect temperature control' },
    { id: 2, category: 'room', icon: '📺', name: 'Smart TV', desc: '40" LED TV with all major streaming apps' },
    { id: 3, category: 'room', icon: '📶', name: 'High-Speed Wi-Fi', desc: '100 Mbps dedicated internet connection' },  
    { id: 10, category: 'service', icon: '🔒', name: '24/7 Security', desc: 'Professional security with CCTV monitoring' },
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'room', label: '🛏️ Room' },
    { id: 'facility', label: '🏊 Facilities' },
    { id: 'service', label: '🤝 Services' }
  ];

  const filtered = activeCategory === 'all' ? amenities : amenities.filter(a => a.category === activeCategory);

  return (
    <div className="amenities-page-pro">
      <div className="amenities-hero-pro">
        <h1>✨ Premium Amenities</h1>
        <p>Everything you need for a comfortable stay</p>
      </div>

      <div className="amenities-container-pro">
        <div className="amenities-filters-pro">
          {categories.map(cat => (
            <button key={cat.id} className={activeCategory === cat.id ? 'filter-active-pro' : 'filter-btn-pro'} onClick={() => setActiveCategory(cat.id)}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="amenities-grid-pro">
          {filtered.map((item) => (
            <div key={item.id} className="amenity-card-pro">
              <div className="amenity-icon-pro">{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="amenities-cta-pro">
          <h2>Ready to Experience Luxury?</h2>
          <p>Book your stay and enjoy all our premium amenities</p>
          <Link to="/rooms" className="cta-btn-pro">Book Now →</Link>
        </div>
      </div>
    </div>
  );
};

export default Amenities;