import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/config';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(auth.currentUser, { displayName: name });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error('Update failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">My Profile</h1>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <span>👤</span>
          </div>

          <div className="profile-info">
            <div className="info-row">
              <label>Name</label>
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <p>{user?.displayName || 'Not set'}</p>
              )}
            </div>

            <div className="info-row">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>

            <div className="info-row">
              <label>User ID</label>
              <p className="user-id">{user?.uid}</p>
            </div>

            <div className="profile-actions">
              {editing ? (
                <>
                  <button 
                    onClick={handleUpdate} 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => setEditing(false)} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setEditing(true)} 
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;