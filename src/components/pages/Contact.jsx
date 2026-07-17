import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Contact = () => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('✅ Message sent successfully!');
      setFormData({ ...formData, subject: '', message: '' });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="contact-page-pro">
      {/* Hero Section */}
      <div className="contact-hero-pro">
        <div className="contact-hero-content-pro">
          <span className="hero-badge-pro">📞 Get in Touch</span>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Reach out to us anytime.</p>
        </div>
      </div>

      <div className="contact-container-pro">
        {/* Contact Cards with Direct Links */}
        <div className="contact-cards-pro">
          {/* Address - Opens Google Maps */}
          <a 
            href="https://maps.app.goo.gl/sBKJSFU4pfXfqL3eA"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card-pro"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            <div className="contact-card-icon">📍</div>
            <h4>Address</h4>
            <p>House No. 1583,1st main road,near Aster CMI Hospital,sahakrnagar post,sanjeevini nagar,kodigehalli gate,Bangalore,Karnataka - 560092</p>
            <small style={{ color: '#1a237e', fontWeight: '500' }}>Click to open map →</small>
          </a>

          {/* Phone - Direct Call */}
          <a 
            href="tel:+919108217506"
            className="contact-card-pro"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            <div className="contact-card-icon">📞</div>
            <h4>Phone</h4>
            <p>+91 9108217506</p>
            <span className="card-sub">Open 24/7</span>
            <small style={{ color: '#28a745', fontWeight: '500' }}>Click to call →</small>
          </a>

          {/* Email - Direct Email */}
          <a 
            href="mailto:info@lasyainnrooms.com"
            className="contact-card-pro"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            <div className="contact-card-icon">✉️</div>
            <h4>Email</h4>
            <p>info@lasyainnrooms.com</p>
            <span className="card-sub">Reply within 24hrs</span>
            <small style={{ color: '#1a237e', fontWeight: '500' }}>Click to email →</small>
          </a>

          {/* Hours - WhatsApp/Map */}
          <a 
            href="https://wa.me/919108217506"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card-pro"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            <div className="contact-card-icon">🕐</div>
            <h4>Working Hours</h4>
            <p>Open 24/7</p>
            <span className="card-sub">Always here to help</span>
            <small style={{ color: '#25D366', fontWeight: '500' }}>Chat on WhatsApp →</small>
          </a>
        </div>

        {/* Form & Map */}
        <div className="contact-row-pro">
          <div className="contact-form-pro">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row-pro">
                <div className="form-group-pro">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group-pro">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="form-row-pro">
                <div className="form-group-pro">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group-pro">
                  <label>Subject <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    placeholder="Enter subject"
                  />
                </div>
              </div>
              <div className="form-group-pro">
                <label>Message <span className="required">*</span></label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  rows="5"
                  placeholder="Enter your message..."
                />
              </div>
              <button type="submit" className="btn-submit-pro" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message ✉️'}
              </button>
            </form>
          </div>

          <div className="contact-map-pro">
            <h2>Find Us Here</h2>
            <div className="map-wrapper-pro">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31104.82513247474!2d77.5945628!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sKodiheghalli%20Gate%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
                title="Lasya Inn Location"
              ></iframe>
            </div>
            <a 
              href="https://maps.app.goo.gl/sBKJSFU4pfXfqL3eA"
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-directions-pro"
            >
              🗺️ Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;