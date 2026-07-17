import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Welcome, {user?.displayName || 'User'}! 👋</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Total Bookings</h3>
          <p style={{ fontSize: '30px', fontWeight: 'bold' }}>0</p>
        </div>
        <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Active Bookings</h3>
          <p style={{ fontSize: '30px', fontWeight: 'bold' }}>0</p>
        </div>
        <div style={{ padding: '20px', background: '#fff3e0', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Wishlist</h3>
          <p style={{ fontSize: '30px', fontWeight: 'bold' }}>0</p>
        </div>
      </div>

      <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
        <h3>Profile Information</h3>
        <p><strong>Name:</strong> {user?.displayName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.uid}</p>
      </div>
    </div>
  );
};

export default Dashboard;