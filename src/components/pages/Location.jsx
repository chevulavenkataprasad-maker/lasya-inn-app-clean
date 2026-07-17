import React from 'react';

const Location = () => {
  // ✅ Your Google Maps Link
  const locationData = {
    address: 'House No. 1583,1st main road,near Aster CMI Hospital,sahakrnagar post,sanjeevini nagar,kodigehalli gate,Bangalore,Karnataka - 560092',
    phone: '+91 9108217506',
    email: 'info@lasyainnrooms.com',
    hours: 'Open 24/7',
    // ✅ Your Google Maps Embed URL
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.123456789!2d77.5945628!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sKodiheghalli%20Gate%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000',
    // ✅ Your Google Maps Directions Link
    directionsUrl: 'https://maps.app.goo.gl/sBKJSFU4pfXfqL3eA'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      padding: '30px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a237e, #0d1445)',
          padding: '50px 20px',
          textAlign: 'center',
          borderRadius: '16px',
          color: 'white',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '38px', margin: '0 0 8px 0' }}>📍 Our Location</h1>
          <p style={{ opacity: '0.9', margin: '0' }}>Find us easily in Bengaluru</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px'
        }}>
          {/* Map */}
          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <iframe
              src={locationData.mapEmbedUrl}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Lasya Inn Location"
            ></iframe>
          </div>

          {/* Location Details */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px',
              background: 'white',
              padding: '18px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <span style={{ fontSize: '24px' }}>📍</span>
              <div>
                <h3 style={{ color: '#1a237e', fontSize: '16px', margin: '0 0 4px 0' }}>Address</h3>
                <p style={{ color: '#666', margin: '0' }}>{locationData.address}</p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px',
              background: 'white',
              padding: '18px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <span style={{ fontSize: '24px' }}>📞</span>
              <div>
                <h3 style={{ color: '#1a237e', fontSize: '16px', margin: '0 0 4px 0' }}>Phone</h3>
                <p style={{ color: '#666', margin: '0' }}>{locationData.phone}</p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px',
              background: 'white',
              padding: '18px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <span style={{ fontSize: '24px' }}>✉️</span>
              <div>
                <h3 style={{ color: '#1a237e', fontSize: '16px', margin: '0 0 4px 0' }}>Email</h3>
                <p style={{ color: '#666', margin: '0' }}>{locationData.email}</p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px',
              background: 'white',
              padding: '18px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <span style={{ fontSize: '24px' }}>🕐</span>
              <div>
                <h3 style={{ color: '#1a237e', fontSize: '16px', margin: '0 0 4px 0' }}>Working Hours</h3>
                <p style={{ color: '#666', margin: '0' }}>{locationData.hours}</p>
              </div>
            </div>

            {/* ✅ Get Directions with your Google Maps Link */}
            <a 
              href={locationData.directionsUrl}
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '14px',
                background: '#ff6f00',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e65100'}
              onMouseLeave={(e) => e.target.style.background = '#ff6f00'}
            >
              🗺️ Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;