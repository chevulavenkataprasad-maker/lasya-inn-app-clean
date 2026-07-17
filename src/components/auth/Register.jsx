import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../firebase/auth';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(email, password, name);
      toast.success('Registration successful! 🎉');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px' }}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have account? <Link to="/login" style={{ color: '#1a237e' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;