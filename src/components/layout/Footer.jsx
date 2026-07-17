import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-section">
          <h3>🏨 LASYA INN ROOMS</h3>
          <p>Comfort, Cleanliness & Affordable Luxury for your perfect stay. We ensure a memorable and comfortable experience.</p>
        </div>

        {/* Quick Links with Icons */}
        <div className="footer-section">
          <h4>🔗 QUICK LINKS</h4>
          <ul>
            <li><Link to="/"><span className="footer-icon">🏠</span> Home</Link></li>
            <li><Link to="/rooms"><span className="footer-icon">🛏️</span> Rooms</Link></li>
            <li><Link to="/amenities"><span className="footer-icon">✨</span> Amenities</Link></li>
            <li><Link to="/gallery"><span className="footer-icon">📸</span> Gallery</Link></li>
            <li><Link to="/reviews"><span className="footer-icon">⭐</span> Reviews</Link></li>
            <li><Link to="/location"><span className="footer-icon">📍</span> Location</Link></li>
            <li><Link to="/contact"><span className="footer-icon">📞</span> Contact</Link></li>
          </ul>
        </div>

        {/* Rooms with Icons */}
        <div className="footer-section">
          <h4>🛏️ ROOMS</h4>
          <ul>
            <li><Link to="/room/1"><span className="footer-icon">❄️</span> Deluxe AC Room</Link></li>
            <li><Link to="/room/2"><span className="footer-icon">🌬️</span> Deluxe Non-AC Room</Link></li>
            <li><Link to="/amenities"><span className="footer-icon">🏊</span> Facilities</Link></li>
          </ul>
        </div>

        {/* Contact with Icons */}
        <div className="footer-section">
          <h4>📞 CONTACT US</h4>
          <ul>
            <li><span className="footer-icon">📍</span> House No. 1583,1st main road,near Aster CMI Hospital,sahakrnagar post,sanjeevini nagar,kodigehalli gate,Bangalore,Karnataka - 560092</li>
            <li><span className="footer-icon">📞</span> +91 9108217506</li>
            <li><span className="footer-icon">✉️</span> info@lasyainnrooms.com</li>
            <li><span className="footer-icon">🕐</span> Open 24/7</li>
          </ul>
        </div>

        {/* Location - Direct Google Maps Link */}
        <div className="footer-section">
          <h4>📍 LOCATION</h4>
          <a 
            href="https://maps.app.goo.gl/sBKJSFU4pfXfqL3eA"
            target="_blank"
            rel="noopener noreferrer"
            className="location-link-footer"
            style={{
              display: 'block',
              padding: '15px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.15)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.08)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📍</div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>Lasya Inn Rooms</div>
            <div style={{ fontSize: '12px', opacity: '0.7', marginTop: '4px' }}>
              Click to view on map →
            </div>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© 2026 LASYA INN ROOMS. All Rights Reserved.</p>
        <p>Designed with ❤️ for our guests</p>
      </div>
    </footer>
  );
};

export default Footer;