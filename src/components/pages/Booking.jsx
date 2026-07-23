// src/components/pages/Booking.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addBooking, updateRoom, getRoom } from '../../firebase/firestore';
import { uploadFileToS3 } from '../../aws/upload';
import { initiatePayment } from '../../services/paymentService';
import toast from 'react-hot-toast';
import './Booking.css';

const Booking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();

  const roomData = location.state || {};
  
  const [submitting, setSubmitting] = useState(false);
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharPreview, setAadharPreview] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [selectedBank, setSelectedBank] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [savedBookingId, setSavedBookingId] = useState(null);
  const [savedBookingData, setSavedBookingData] = useState(null);

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
    checkOutTime: '12:00',
    guests: 1,
    specialRequests: '',
    roomId: roomData.roomId || roomId || '',
    roomName: roomData.roomName || 'Deluxe AC Room',
    roomPrice: roomData.roomPrice || 1200,
    roomType: roomData.roomType || 'ac',
    roomImage: roomData.imageUrl || ''
  });

  useEffect(() => {
    console.log('📋 Room Data from state:', roomData);
    console.log('📋 Room ID from URL:', roomId);
    
    if (!roomData.roomName && roomId) {
      fetchRoomDetails(roomId);
    }
  }, [roomId, roomData]);

  const fetchRoomDetails = async (id) => {
    try {
      const room = await getRoom(id);
      if (room) {
        setFormData(prev => ({
          ...prev,
          roomId: room.id,
          roomName: room.name || 'Deluxe AC Room',
          roomPrice: room.price || 1200,
          roomType: room.type || 'ac',
          roomImage: room.image || ''
        }));
      }
    } catch (error) {
      console.error('❌ Error fetching room:', error);
      toast.error('Failed to load room details');
    }
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', name: 'Card', icon: '💳', desc: 'Credit/Debit Card' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', desc: 'All major banks' },
    { id: 'wallet', name: 'Wallet', icon: '👛', desc: 'PhonePe, Paytm, Amazon' }
  ];

  const banks = [
    { id: 'sbi', name: 'SBI' },
    { id: 'hdfc', name: 'HDFC' },
    { id: 'icici', name: 'ICICI' },
    { id: 'axis', name: 'Axis' },
    { id: 'kotak', name: 'Kotak' },
    { id: 'yes', name: 'Yes Bank' }
  ];

  // ============================================
  // ✅ CALCULATE 24-HOURS PRICE
  // ============================================
  const calculateTotal = () => {
    if (formData.checkInDate && formData.checkInTime && formData.checkOutDate && formData.checkOutTime) {
      const checkInDateTime = new Date(`${formData.checkInDate}T${formData.checkInTime}:00`);
      const checkOutDateTime = new Date(`${formData.checkOutDate}T${formData.checkOutTime}:00`);
      
      const diffMs = checkOutDateTime - checkInDateTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours <= 0) {
        return { total: 0, totalDays: 0, totalHours: 0 };
      }
      
      // Each 24 hours = 1 day charge
      const days = Math.ceil(diffHours / 24);
      const totalDays = days > 0 ? days : 1;
      const total = totalDays * (formData.roomPrice || 1200);
      
      return {
        total: total,
        totalDays: totalDays,
        totalHours: diffHours
      };
    }
    return { total: formData.roomPrice || 1200, totalDays: 1, totalHours: 24 };
  };

  const calculateResult = calculateTotal();
  const totalAmount = calculateResult.total;
  const totalDays = calculateResult.totalDays;
  const totalHours = Math.round(calculateResult.totalHours);

  // ============================================
  // ✅ HANDLE FORM SUBMIT - With Room Availability
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
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
    if (!formData.checkInTime || !formData.checkOutTime) {
      toast.error('Please select check-in and check-out time');
      return;
    }
    
    // Check if check-out is after check-in
    const checkInDateTime = new Date(`${formData.checkInDate}T${formData.checkInTime}:00`);
    const checkOutDateTime = new Date(`${formData.checkOutDate}T${formData.checkOutTime}:00`);
    if (checkOutDateTime <= checkInDateTime) {
      toast.error('Check-out must be after check-in');
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
    if (!formData.roomId) {
      toast.error('Room information missing. Please go back and select a room.');
      return;
    }

    setSubmitting(true);

    try {
      let aadharUrl = '';
      if (aadharFile) {
        aadharUrl = await uploadFileToS3(aadharFile, 'aadhar');
      }

      // ✅ 1. Get current room data
      const room = await getRoom(formData.roomId);
      const currentAvailable = room.availableRooms || 0;
      
      if (currentAvailable <= 0) {
        toast.error('Room is fully booked!');
        setSubmitting(false);
        return;
      }
      
      const newAvailable = currentAvailable - 1;

      // ✅ 2. Update room availability
      await updateRoom(formData.roomId, {
        availableRooms: newAvailable,
        isAvailable: newAvailable > 0
      });

      // ✅ 3. Create booking with 24 hours data
      const bookingData = {
        userId: user.uid,
        userName: user.displayName || 'Guest',
        userEmail: user.email,
        roomId: formData.roomId,
        roomName: formData.roomName,
        roomType: formData.roomType,
        roomPrice: formData.roomPrice,
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
        totalHours: totalHours,
        totalDays: totalDays,
        totalPrice: totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('📝 Booking Data:', bookingData);

      const bookingId = await addBooking(bookingData);
      console.log('✅ Booking saved with ID:', bookingId);

      setSavedBookingId(bookingId);
      setSavedBookingData(bookingData);
      setShowPayment(true);

      toast.success('📋 Booking details saved! Please complete payment.');

    } catch (error) {
      console.error('❌ Booking error:', error);
      toast.error('Booking failed: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ HANDLE PAYMENT - No auto-confirm
  // ============================================
  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (selectedMethod === 'upi' && !upiId) {
      toast.error('Please enter UPI ID');
      return;
    }

    setPaymentLoading(true);

    try {
      const paymentData = {
        method: selectedMethod,
        bookingId: savedBookingId,
        amount: totalAmount,
        guestName: formData.guestName,
        guestPhone: formData.guestPhone,
        guestEmail: formData.guestEmail,
        upiId: selectedMethod === 'upi' ? upiId : undefined,
        cardDetails: selectedMethod === 'card' ? cardDetails : undefined,
        bank: selectedMethod === 'netbanking' ? selectedBank : undefined
      };

      const result = await initiatePayment(paymentData);

      if (result.success) {
        toast.success('✅ Payment successful! Booking pending admin approval.');
        navigate('/booking-success', {
          state: {
            bookingId: savedBookingId,
            booking: savedBookingData,
            paymentId: result.paymentId,
            status: 'pending'
          }
        });
      } else {
        toast.error(result.message || 'Payment failed. Please try again.');
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error('Payment failed: ' + error.message);
    } finally {
      setPaymentLoading(false);
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

  const renderPaymentSection = () => {
    if (!showPayment) return null;

    return (
      <div className="payment-section-pro">
        <div className="payment-header-pro">
          <h3>💳 Complete Payment</h3>
          <p className="payment-amount">Total: ₹{totalAmount}</p>
        </div>

        <div className="payment-methods-grid">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="method-icon">{method.icon}</div>
              <div className="method-name">{method.name}</div>
              <div className="method-desc">{method.desc}</div>
            </div>
          ))}
        </div>

        {selectedMethod === 'upi' && (
          <div className="payment-form-pro">
            <h4>📱 UPI Payment</h4>
            <div className="upi-options">
              <button type="button" className="upi-app-btn" onClick={() => setUpiId('yourname@paytm')}>
                Paytm
              </button>
              <button type="button" className="upi-app-btn" onClick={() => setUpiId('yourname@okhdfcbank')}>
                Google Pay
              </button>
              <button type="button" className="upi-app-btn" onClick={() => setUpiId('yourname@ybl')}>
                PhonePe
              </button>
            </div>
            <div className="upi-input-group">
              <input
                type="text"
                placeholder="Enter UPI ID (e.g., name@upi)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedMethod === 'card' && (
          <div className="payment-form-pro">
            <h4>💳 Card Payment</h4>
            <div className="card-input-group">
              <input
                type="text"
                placeholder="Card Number"
                value={cardDetails.number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.replace(/(.{4})/g, '$1 ').trim();
                  setCardDetails({...cardDetails, number: formatted});
                }}
                maxLength="19"
              />
              <div className="card-row">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      const formatted = value.length > 2 ? `${value.slice(0,2)}/${value.slice(2)}` : value;
                      setCardDetails({...cardDetails, expiry: formatted});
                    }
                  }}
                  maxLength="5"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setCardDetails({...cardDetails, cvv: value});
                    }
                  }}
                  maxLength="4"
                />
              </div>
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
              />
            </div>
            <div className="card-logos">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>RuPay</span>
            </div>
          </div>
        )}

        {selectedMethod === 'netbanking' && (
          <div className="payment-form-pro">
            <h4>🏦 Net Banking</h4>
            <div className="bank-grid">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  className={`bank-btn ${selectedBank === bank.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBank(bank.id)}
                >
                  {bank.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedMethod === 'wallet' && (
          <div className="payment-form-pro">
            <h4>👛 Wallet Payment</h4>
            <div className="wallet-options">
              <button type="button" className="wallet-btn" onClick={() => setSelectedMethod('wallet')}>
                <span>📱</span> PhonePe Wallet
              </button>
              <button type="button" className="wallet-btn" onClick={() => setSelectedMethod('wallet')}>
                <span>📱</span> Paytm Wallet
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn-pay-pro"
          onClick={handlePayment}
          disabled={paymentLoading}
        >
          {paymentLoading ? 'Processing...' : `Pay ₹${totalAmount}`}
        </button>

        <p className="secure-payment">🔒 Secure & Encrypted Payment</p>
      </div>
    );
  };

  return (
    <div className="booking-page-pro">
      <div className="booking-hero-pro">
        <h1>📅 Complete Your Booking</h1>
        <p>Please fill all details to confirm your booking</p>
      </div>

      <div className="booking-container-pro">
        <form onSubmit={handleSubmit} className="booking-form-pro">
          <div className="booking-section-pro room-details-display">
            <h3>🛏️ Selected Room</h3>
            <div className="room-summary">
              {formData.roomImage && (
                <img src={formData.roomImage} alt={formData.roomName} className="room-thumbnail" />
              )}
              <div className="room-info">
                <h4>{formData.roomName}</h4>
                {/* ✅ CHANGED: / night → / 24 hours */}
                <p>₹{formData.roomPrice} <span>/ 24 hours</span></p>
                <p className="room-type">{formData.roomType === 'ac' ? '❄️ AC Room' : '🌬️ Non-AC Room'}</p>
              </div>
            </div>
          </div>

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

          <div className="booking-section-pro">
            <h3>📝 Special Requests</h3>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
              rows="3"
              placeholder="Any special requests? (e.g., early check-in, extra bedding, etc.)"
            />
          </div>

          {/* ✅ CHANGED: Booking Summary with 24 hours */}
          <div className="booking-section-pro amount-summary-pro">
            <h3>💰 Booking Summary</h3>
            <div className="amount-details">
              <div className="amount-row">
                <span>Room: {formData.roomName}</span>
                <span>₹{formData.roomPrice}/24 hours</span>
              </div>
              <div className="amount-row">
                <span>Total Hours: {totalHours} hours</span>
                <span>{totalDays} day(s)</span>
              </div>
              <div className="amount-row total">
                <span><strong>Total Amount</strong></span>
                <span><strong>₹{totalAmount}</strong></span>
              </div>
            </div>
          </div>

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
              {submitting ? 'Processing...' : '💰 Proceed to Payment'}
            </button>
          </div>
        </form>

        {renderPaymentSection()}
      </div>
    </div>
  );
};

export default Booking;