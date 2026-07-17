// src/components/admin/AdminLogin.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ ADMIN CREDENTIALS
  const adminCredentials = [
    { email: 'lasyainnrooms@gmail.com', password: 'Lasya@1999!' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('=================================');
    console.log('📧 Entered Email:', email);
    console.log('🔒 Entered Password:', password);
    console.log('=================================');
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Check credentials
      let isValid = false;
      let matchedUser = null;
      
      for (let cred of adminCredentials) {
        console.log(`🔍 Checking: ${cred.email} / ${cred.password}`);
        if (cred.email === email && cred.password === password) {
          isValid = true;
          matchedUser = cred;
          console.log('✅ MATCH FOUND!');
          break;
        }
      }
      
      console.log('✅ Valid Credentials:', isValid);
      console.log('👤 Matched User:', matchedUser);
      
      if (isValid) {
        toast.success('✅ Login successful!');
        
        // Save admin session
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminEmail', email);
        
        console.log('🚀 Redirecting to /admin');
        window.location.href = '/admin';
        
      } else {
        // Check if email exists
        const emailExists = adminCredentials.some(cred => cred.email === email);
        console.log('📧 Email exists:', emailExists);
        
        if (emailExists) {
          toast.error('❌ Wrong password');
        } else {
          toast.error('❌ Invalid email or password');
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        
        {/* ========================================= */}
        {/* ✅ LOGO WITH BUILDING IMAGE */}
        {/* ========================================= */}
        <div className="admin-login-logo">
          {/* 👇 Building Image Logo */}
          <img 
            src="/images/admin-building.jpeg" 
            alt="Admin Building"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '10px',
              border: '3px solid #bf5614',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
            }}
          />
          <h1>LASYA INN ROOMS</h1>
          <p>Admin Login</p>
        </div>

        {/* Show available credentials */}
        <div style={{ 
          background: '#f0f4ff', 
          padding: '10px', 
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#1a237e' }}>
            🔑 Enter your admin credentials
          </p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          
          <div className="form-group">
            <label>📧 Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Admin Email"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>🔒 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? '⏳ Logging in...' : '🔐 Admin Login'}
          </button>
          
        </form>

        <div className="admin-login-footer">
          <p>🔐 Secure Admin Access</p>
          <Link to="/login" className="user-login-link">
            👤 User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;