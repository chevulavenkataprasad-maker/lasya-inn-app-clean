// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLogin from './components/admin/AdminLogin';
import Dashboard from './components/Dashboard';
import Home from './components/pages/Home';
import Rooms from './components/pages/Rooms';
import RoomDetails from './components/pages/RoomDetails';
import Amenities from './components/pages/Amenities';
import Gallery from './components/pages/Gallery';
import Reviews from './components/pages/Reviews';
import Location from './components/pages/Location';
import Contact from './components/pages/Contact';
import Booking from './components/pages/Booking';
import BookingSuccess from './components/pages/BookingSuccess';

// Admin Imports
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRooms from './components/admin/AdminRooms';
import AdminBookings from './components/admin/AdminBookings';

import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          
          {/* ========================================= */}
          {/* PUBLIC ROUTES */}
          {/* ========================================= */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/room/:id" element={<RoomDetails />} />
          <Route path="/amenities" element={<Amenities />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/location" element={<Location />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* ========================================= */}
          {/* LOGIN ROUTES */}
          {/* ========================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* ========================================= */}
          {/* USER ROUTES - Protected */}
          {/* ========================================= */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/booking" element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          } />
          
          <Route path="/booking-success" element={
            <ProtectedRoute>
              <BookingSuccess />
            </ProtectedRoute>
          } />

          {/* ========================================= */}
          {/* ADMIN ROUTES - Protected */}
          {/* ========================================= */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/rooms" element={
            <ProtectedRoute>
              <AdminRooms />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/bookings" element={
            <ProtectedRoute>
              <AdminBookings />
            </ProtectedRoute>
          } />
          
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;