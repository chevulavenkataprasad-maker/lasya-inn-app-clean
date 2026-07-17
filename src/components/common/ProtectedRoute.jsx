// src/components/common/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🔍 ProtectedRoute - User:', user);
  console.log('🔍 ProtectedRoute - Loading:', loading);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // ✅ Check if admin is logged in via localStorage
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const adminEmail = localStorage.getItem('adminEmail');

  console.log('🔍 Admin Logged In:', isAdminLoggedIn);
  console.log('🔍 Admin Email:', adminEmail);

  // ✅ If admin is logged in, allow access
  if (isAdminLoggedIn) {
    console.log('✅ Admin logged in, allowing access');
    return children;
  }

  // ✅ If user is logged in, allow access
  if (user) {
    console.log('✅ User logged in, allowing access');
    return children;
  }

  // ✅ If no one is logged in, redirect to login
  console.log('❌ No one logged in, redirecting to login');
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;