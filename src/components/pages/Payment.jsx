import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Payment = ({ bookingDetails, onSuccess }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi', name: 'UPI', icon: '📱' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'cash', name: 'Pay at Hotel', icon: '💰' }
  ];

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      toast.success('✅ Payment successful!');
      setLoading(false);
      if (onSuccess) onSuccess();
      navigate('/booking-success');
    }, 2000);
  };

  return (
    <div className="payment-container">
      <h2>💰 Payment Details</h2>
      
      <div className="payment-summary">
        <h3>Booking Summary</h3>
        <div className="payment-row">
          <span>Room:</span>
          <span>{bookingDetails?.roomName || 'Deluxe AC Room'}</span>
        </div>
        <div className="payment-row">
          <span>Check-in:</span>
          <span>{bookingDetails?.checkIn || '2024-01-15'}</span>
        </div>
        <div className="payment-row">
          <span>Check-out:</span>
          <span>{bookingDetails?.checkOut || '2024-01-17'}</span>
        </div>
        <div className="payment-row">
          <span>Guests:</span>
          <span>{bookingDetails?.guests || 2}</span>
        </div>
        <div className="payment-row total">
          <span>Total Amount:</span>
          <span>₹{bookingDetails?.totalPrice || 2400}</span>
        </div>
      </div>

      <form onSubmit={handlePayment}>
        <div className="payment-methods">
          <label>Select Payment Method</label>
          <div className="payment-methods-grid">
            {paymentMethods.map((method) => (
              <div 
                key={method.id}
                className={`payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
              >
                <span>{method.icon}</span>
                <p>{method.name}</p>
              </div>
            ))}
          </div>
        </div>

        {paymentMethod === 'card' && (
          <div className="card-details">
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input type="password" placeholder="***" maxLength="3" />
              </div>
            </div>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input type="text" placeholder="John Doe" />
            </div>
          </div>
        )}

        {paymentMethod === 'upi' && (
          <div className="upi-details">
            <div className="form-group">
              <label>UPI ID</label>
              <input type="text" placeholder="example@upi" />
            </div>
            <div className="upi-apps">
              <button type="button" className="upi-app">📱 Google Pay</button>
              <button type="button" className="upi-app">📱 PhonePe</button>
              <button type="button" className="upi-app">📱 Paytm</button>
            </div>
          </div>
        )}

        {paymentMethod === 'netbanking' && (
          <div className="netbanking-details">
            <div className="form-group">
              <label>Select Bank</label>
              <select>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>
          </div>
        )}

        {paymentMethod === 'cash' && (
          <div className="cash-details">
            <p>💰 Pay at the hotel during check-in</p>
            <p style={{ color: '#666', fontSize: '14px' }}>No advance payment required</p>
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Processing...' : `Pay ₹${bookingDetails?.totalPrice || 2400}`}
        </button>
      </form>
    </div>
  );
};

export default Payment;