// src/services/paymentService.js

import toast from 'react-hot-toast';

export const initiatePayment = async (paymentData) => {
  try {
    // Mock payment - Replace with actual API call
    console.log('💰 Payment initiated:', paymentData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo - always success
    return {
      success: true,
      paymentId: `PAY${Date.now()}`,
      message: 'Payment successful'
    };
    
  } catch (error) {
    console.error('Payment error:', error);
    return {
      success: false,
      message: error.message || 'Payment failed'
    };
  }
};