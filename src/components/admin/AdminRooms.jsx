// src/components/admin/AdminRooms.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRooms, addRoom, updateRoom, deleteRoom } from '../../firebase/firestore';
import { uploadFileToS3 } from '../../aws/upload';
import toast from 'react-hot-toast';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'ac',
    price: '',
    guests: 2,
    bed: '1 King Bed',
    description: '',
    amenities: '',
    totalRooms: '',
    availableRooms: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      if (data && data.length > 0) {
        setRooms(data);
      } else {
        setRooms([
          { id: '1', name: 'Deluxe AC Room', type: 'ac', price: 1200, guests: 2, bed: '1 King Bed', totalRooms: 5, availableRooms: 5 },
          { id: '2', name: 'Deluxe Non-AC Room', type: 'non-ac', price: 800, guests: 2, bed: '1 King Bed', totalRooms: 3, availableRooms: 3 }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // ✅ ADD ROOM - With availableRooms
  // ============================================
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadFileToS3(imageFile, 'rooms');
      }
      
      // ✅ Check availableRooms
      const availableRooms = Number(formData.availableRooms) || Number(formData.totalRooms) || 0;
      if (availableRooms <= 0) {
        toast.error('Available rooms must be greater than 0');
        setSubmitting(false);
        return;
      }
      
      const roomData = {
        name: formData.name,
        type: formData.type,
        price: Number(formData.price),
        guests: Number(formData.guests),
        bed: formData.bed,
        description: formData.description || '',
        amenities: formData.amenities ? formData.amenities.split(',').map(item => item.trim()) : [],
        image: imageUrl,
        totalRooms: Number(formData.totalRooms) || availableRooms,
        availableRooms: availableRooms,
        isAvailable: true,
        createdAt: new Date().toISOString()
      };
      
      console.log('📝 Adding room:', roomData);
      
      await addRoom(roomData);
      toast.success('✅ Room added successfully!');
      resetForm();
      await fetchRooms();
      
    } catch (error) {
      console.error('❌ Add room error:', error);
      toast.error('Failed to add room: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ EDIT ROOM - With availableRooms
  // ============================================
  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      type: room.type || 'ac',
      price: room.price || '',
      guests: room.guests || 2,
      bed: room.bed || '1 King Bed',
      description: room.description || '',
      amenities: room.amenities ? room.amenities.join(', ') : '',
      totalRooms: room.totalRooms || '',
      availableRooms: room.availableRooms || 0  // ✅ Set to 0 if not available
    });
    setImagePreview(room.image || '');
    setShowForm(true);
  };

  // ============================================
  // ✅ UPDATE ROOM - Admin updates availableRooms
  // ============================================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let imageUrl = editingRoom?.image || '';
      if (imageFile) {
        imageUrl = await uploadFileToS3(imageFile, 'rooms');
      }
      
      const availableRooms = Number(formData.availableRooms) || 0;
      
      const roomData = {
        name: formData.name,
        type: formData.type,
        price: Number(formData.price),
        guests: Number(formData.guests),
        bed: formData.bed,
        description: formData.description || '',
        amenities: formData.amenities ? formData.amenities.split(',').map(item => item.trim()) : [],
        image: imageUrl,
        totalRooms: Number(formData.totalRooms) || availableRooms,
        availableRooms: availableRooms,
        isAvailable: availableRooms > 0,  // ✅ Auto update based on availableRooms
        updatedAt: new Date().toISOString()
      };
      
      await updateRoom(editingRoom.id, roomData);
      
      // ✅ Show toast with availability status
      if (availableRooms > 0) {
        toast.success(`✅ Room updated! ${availableRooms} rooms available`);
      } else {
        toast.warning(`⚠️ Room set to 0 - Not available for booking`);
      }
      
      resetForm();
      await fetchRooms();
      
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error('Failed to update room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await deleteRoom(id);
      toast.success('✅ Room deleted successfully!');
      await fetchRooms();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRoom(null);
    setFormData({
      name: '',
      type: 'ac',
      price: '',
      guests: 2,
      bed: '1 King Bed',
      description: '',
      amenities: '',
      totalRooms: '',
      availableRooms: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="admin-loading-pro">
        <div className="spinner-pro"></div>
        <p>Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="admin-rooms-pro">
      <div className="admin-header-pro">
        <div>
          <h1>🛏️ Manage Rooms</h1>
          <p>Add, edit, or delete rooms</p>
          <span className="room-count-pro">{rooms.length} rooms</span>
        </div>
        <div className="admin-actions-pro">
          <button className="btn-add-pro" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '➕ Add Room'}
          </button>
          <Link to="/admin" className="btn-back-pro">← Back</Link>
        </div>
      </div>

      {showForm && (
        <div className="admin-form-pro">
          <h3>{editingRoom ? '✏️ Edit Room' : '➕ Add New Room'}</h3>
          <form onSubmit={editingRoom ? handleUpdate : handleAdd}>
            <div className="form-grid-pro">
              <div className="form-group-pro">
                <label>Room Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                  placeholder="e.g., Deluxe AC Room" 
                />
              </div>
              
              <div className="form-group-pro">
                <label>Room Type <span className="required">*</span></label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="ac">AC Room</option>
                  <option value="non-ac">Non-AC Room</option>
                </select>
              </div>
              
              <div className="form-group-pro">
                <label>Price per Night <span className="required">*</span></label>
                <input 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  required 
                  placeholder="e.g., 1200" 
                />
              </div>
              
              <div className="form-group-pro">
                <label>Guests <span className="required">*</span></label>
                <input 
                  type="number" 
                  value={formData.guests} 
                  onChange={(e) => setFormData({...formData, guests: Number(e.target.value)})} 
                  min="1" 
                  max="4" 
                  required 
                />
              </div>
              
              <div className="form-group-pro">
                <label>Bed Type</label>
                <input 
                  type="text" 
                  value={formData.bed} 
                  onChange={(e) => setFormData({...formData, bed: e.target.value})} 
                  placeholder="e.g., 1 King Bed" 
                />
              </div>

              {/* ✅ TOTAL ROOMS */}
              <div className="form-group-pro">
                <label>Total Rooms <span className="required">*</span></label>
                <input 
                  type="number" 
                  value={formData.totalRooms} 
                  onChange={(e) => setFormData({...formData, totalRooms: e.target.value})} 
                  required 
                  min="1" 
                  placeholder="e.g., 5" 
                />
              </div>

              {/* ✅ AVAILABLE ROOMS - Admin sets this */}
              <div className="form-group-pro" style={{ border: '2px solid #4CAF50', borderRadius: '8px', padding: '10px' }}>
                <label style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  Available Rooms <span className="required">*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.availableRooms} 
                  onChange={(e) => setFormData({...formData, availableRooms: e.target.value})} 
                  required 
                  min="0" 
                  placeholder="e.g., 5" 
                />
                <small style={{ color: '#4CAF50', display: 'block', marginTop: '5px' }}>
                  ⚠️ Set to <strong>0</strong> to hide from Available Rooms
                </small>
              </div>
              
              <div className="form-group-pro">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview-pro" />}
              </div>
              
              <div className="form-group-pro full-width">
                <label>Amenities (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.amenities} 
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})} 
                  placeholder="e.g., TV, Free Wi-Fi, Room Service" 
                />
              </div>
              
              <div className="form-group-pro full-width">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  rows="3" 
                  placeholder="Room description..." 
                />
              </div>
            </div>
            
            <button type="submit" className="btn-save-pro" disabled={submitting}>
              {submitting ? 'Saving...' : editingRoom ? '💾 Update Room' : '➕ Add Room'}
            </button>
          </form>
        </div>
      )}

      <div className="admin-table-pro">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>Guests</th>
              <th>Total</th>
              <th>Available</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => {
              const availableCount = room.availableRooms || 0;
              const isAvailable = availableCount > 0;
              
              return (
                <tr key={room.id}>
                  <td>
                    {room.image ? (
                      <img src={room.image} alt={room.name} className="table-image-pro" />
                    ) : (
                      <span className="table-icon-pro">🛏️</span>
                    )}
                  </td>
                  <td><strong>{room.name}</strong></td>
                  <td>{room.type === 'ac' ? '❄️ AC' : '🌬️ Non-AC'}</td>
                  <td>₹{room.price}</td>
                  <td>{room.guests}</td>
                  <td>{room.totalRooms || '-'}</td>
                  <td>
                    <span style={{ 
                      color: isAvailable ? '#4CAF50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {availableCount}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${isAvailable ? 'available' : 'booked'}`}>
                      {isAvailable ? '✅ Available' : '❌ Booked'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit-pro" onClick={() => handleEdit(room)}>✏️ Edit</button>
                    <button className="btn-delete-pro" onClick={() => handleDelete(room.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRooms;