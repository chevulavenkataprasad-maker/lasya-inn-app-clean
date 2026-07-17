import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addBooking } from '../../firebase/firestore';
import { uploadFileToS3 } from '../../aws/upload';
import toast from 'react-hot-toast';

const Booking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharPreview, setAadharPreview] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [formData, setFormData] = useState({
    guestName: user?.displayName || '',
    guestEmail: user?.email || '',
    guestPhone: '',
    guestAddress: '',
    guestCity: '',
    guestPincode: '',
    aadharNumber: '',
    aadharName: '',
    checkInDate: '',
    checkInTime: '12:00',
    checkOutDate: '',
    checkOutTime: '11:00',
    guests: 1,
    specialRequests: '',
    roomName: 'Deluxe AC Room',
    roomPrice: 1200,
    roomType: 'ac'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.guestName) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.guestPhone || formData.guestPhone.length < 10) {
      toast.error('Please enter valid 10-digit mobile number');
      return;
    }
    if (!formData.guestEmail) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.aadharNumber || formData.aadharNumber.length !== 12) {
      toast.error('Please enter valid 12-digit Aadhar number');
      return;
    }
    if (!formData.aadharName) {
      toast.error('Please enter name as per Aadhar');
      return;
    }
    if (!formData.checkInDate || !formData.checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (!aadharFile) {
      toast.error('Please upload Aadhar card photo');
      return;
    }
    if (!agreeTerms) {
      toast.error('Please agree to Terms & Conditions');
      return;
    }
    if (!user) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }

    setSubmitting(true);

    try {
      let aadharUrl = '';
      if (aadharFile) {
        aadharUrl = await uploadFileToS3(aadharFile, 'aadhar');
      }

      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const totalPrice = days * (formData.roomPrice || 1200);

      const bookingData = {
        userId: user.uid,
        userName: user.displayName || 'Guest',
        userEmail: user.email,
        roomName: formData.roomName || 'Deluxe AC Room',
        roomType: formData.roomType || 'ac',
        roomPrice: formData.roomPrice || 1200,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        guestAddress: formData.guestAddress,
        guestCity: formData.guestCity,
        guestPincode: formData.guestPincode,
        aadharNumber: formData.aadharNumber,
        aadharName: formData.aadharName,
        aadharPhoto: aadharUrl,
        checkInDate: formData.checkInDate,
        checkInTime: formData.checkInTime,
        checkOutDate: formData.checkOutDate,
        checkOutTime: formData.checkOutTime,
        guests: formData.guests,
        specialRequests: formData.specialRequests,
        totalDays: days,
        totalPrice: totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('📝 Saving booking:', bookingData);
      const bookingId = await addBooking(bookingData);
      console.log('✅ Booking saved with ID:', bookingId);
      
      toast.success('🎉 Booking Confirmed!');
      navigate('/booking-success', { 
        state: { 
          bookingId, 
          booking: bookingData 
        }
      });
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      toast.error('Booking failed: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAadharUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setAadharFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadharPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="booking-page-pro">
      <div className="booking-hero-pro">
        <h1>📅 Complete Your Booking</h1>
        <p>Please fill all details to confirm your booking</p>
      </div>

      <div className="booking-container-pro">
        <form onSubmit={handleSubmit} className="booking-form-pro">
          {/* Date & Time */}
          <div className="booking-section-pro">
            <h3>📅 Date & Time</h3>
            <div className="booking-grid-pro">
              <div>
                <label>Check-in Date <span className="required">*</span></label>
                <input
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label>Check-in Time <span className="required">*</span></label>
                <select
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({...formData, checkInTime: e.target.value})}
                >
                  {['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Check-out Date <span className="required">*</span></label>
                <input
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                  required
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label>Check-out Time <span className="required">*</span></label>
                <select
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({...formData, checkOutTime: e.target.value})}
                >
                  {['06:00','07:00','08:00','09:00','10:00','11:00','12:00'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div className="booking-section-pro">
            <h3>👤 Guest Details</h3>
            <div className="booking-grid-pro">
              <div>
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label>Mobile <span className="required">*</span></label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setFormData({...formData, guestPhone: value});
                    }
                  }}
                  required
                  maxLength="10"
                  placeholder="10-digit mobile number"
                />
              </div>
              <div>
                <label>Guests <span className="required">*</span></label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData({...formData, guests: Number(e.target.value)})}
                >
                  {[1,2,3,4].map(g => (
                    <option key={g} value={g}>{g} Guest{g > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="booking-section-pro">
            <h3>📍 Address Details</h3>
            <div className="booking-grid-pro">
              <div className="full-width">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.guestAddress}
                  onChange={(e) => setFormData({...formData, guestAddress: e.target.value})}
                  placeholder="Enter your address"
                />
              </div>
              <div>
                <label>City</label>
                <input
                  type="text"
                  value={formData.guestCity}
                  onChange={(e) => setFormData({...formData, guestCity: e.target.value})}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <label>Pincode</label>
                <input
                  type="text"
                  value={formData.guestPincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setFormData({...formData, guestPincode: value});
                    }
                  }}
                  maxLength="6"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>

          {/* Aadhar */}
          <div className="booking-section-pro aadhar-section-pro">
            <h3>🪪 Aadhar Details <span className="required">*</span></h3>
            <div className="booking-grid-pro">
              <div>
                <label>Aadhar Number <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 12) {
                      setFormData({...formData, aadharNumber: value});
                    }
                  }}
                  required
                  maxLength="12"
                  placeholder="12-digit Aadhar number"
                />
              </div>
              <div>
                <label>Name as per Aadhar <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.aadharName}
                  onChange={(e) => setFormData({...formData, aadharName: e.target.value})}
                  required
                  placeholder="Name as per Aadhar"
                />
              </div>
              <div className="full-width">
                <label>Aadhar Photo <span className="required">*</span></label>
                <div className="file-upload-pro">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAadharUpload}
                    required
                    id="aadhar-upload"
                  />
                  <label htmlFor="aadhar-upload" className="upload-label-pro">
                    {aadharPreview ? (
                      <img src={aadharPreview} alt="Aadhar" className="aadhar-preview-pro" />
                    ) : (
                      <div>
                        <span>📤</span>
                        <p>Click to upload Aadhar photo</p>
                        <small>JPG, PNG (Max 5MB)</small>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="booking-section-pro">
            <h3>📝 Special Requests</h3>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
              rows="3"
              placeholder="Any special requests? (e.g., early check-in, extra bedding, etc.)"
            />
          </div>

          {/* Terms & Submit */}
          <div className="booking-actions-pro">
            <div className="terms-pro">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms">
                I agree to the <a href="/terms">Terms &amp; Conditions</a> and <a href="/privacy">Privacy Policy</a>
              </label>
            </div>
            <button
              type="submit"
              className="btn-submit-pro"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : '💰 Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;