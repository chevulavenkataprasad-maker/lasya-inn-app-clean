// src/components/pages/Gallery.jsx

import React, { useState, useEffect } from 'react';
import { uploadFileToS3 } from '../../aws/upload';
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Gallery.css';

const Gallery = () => {
  const { user } = useAuth();
  
  // ✅ Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  // ✅ Admin Credentials
  const adminCredentials = [
    { email: 'lasyainnrooms@gmail.com', password: 'Lasya@1999!' }
  ];

  // ✅ Check if already logged in
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsAdmin(isAdminLoggedIn);
  }, []);

  // ✅ Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    if (!adminEmail || !adminPassword) {
      toast.error('Please enter admin credentials');
      return;
    }

    try {
      setAdminLoading(true);
      
      const isValid = adminCredentials.some(
        cred => cred.email === adminEmail && cred.password === adminPassword
      );
      
      if (isValid) {
        toast.success('✅ Admin verified!');
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminEmail', adminEmail);
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminEmail('');
        setAdminPassword('');
        
        // ✅ If there is a pending file, upload it
        if (pendingFile) {
          await handleUpload(pendingFile);
          setPendingFile(null);
        }
      } else {
        toast.error('❌ Invalid admin credentials');
      }
      
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Admin verification failed');
    } finally {
      setAdminLoading(false);
    }
  };

  // ✅ Handle File Select - Show Admin Login
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // ✅ Check if admin is logged in
    if (isAdmin) {
      // ✅ Already admin - upload directly
      handleUpload(file);
    } else {
      // ✅ Not admin - show login modal
      setPendingFile(file);
      setShowAdminLogin(true);
    }
    
    // Reset input
    e.target.value = '';
  };

  // ✅ Upload File
  const handleUpload = async (file) => {
    if (!file) {
      toast.error('No file selected');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      console.log('📤 Uploading file:', file.name);
      const url = await uploadFileToS3(file, 'gallery');
      console.log('✅ Uploaded URL:', url);

      const imageData = {
        url: url,
        title: file.name.split('.')[0],
        category: 'Rooms',
        createdAt: new Date().toISOString(),
        uploadedBy: user?.email || 'admin'
      };

      await addGalleryImage(imageData);
      console.log('✅ Saved to Firestore');

      toast.success('✅ Image uploaded successfully!');
      await fetchImages();
      setShowUpload(false);
      setPendingFile(null);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ... rest of states and functions

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);

  const categories = ['All', 'Exterior', 'Rooms', 'Facilities', 'Common Areas'];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getGalleryImages();
      console.log('📸 Gallery Images:', data);
      
      if (data && data.length > 0) {
        setImages(data);
      } else {
        setImages([
          { id: '1', url: '🏨', title: 'Hotel Exterior', category: 'Exterior' },
          { id: '2', url: '🛏️', title: 'Deluxe Room', category: 'Rooms' },
          { id: '3', url: '🏊', title: 'Swimming Pool', category: 'Facilities' }
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      await deleteGalleryImage(id);
      toast.success('Image deleted');
      fetchImages();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete');
    }
  };

  const filteredImages = activeCategory === 'All' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  if (loading) {
    return (
      <div className="gallery-loading-pro">
        <div className="spinner-pro"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="gallery-page-pro">
      
      <div className="gallery-container-pro">
        
        {/* ============================================ */}
        {/* UPLOAD SECTION */}
        {/* ============================================ */}
        <div className="gallery-upload-pro">
          {isAdmin ? (
            // ✅ Admin is logged in - Show upload
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="upload-toggle-btn"
                  onClick={() => setShowUpload(!showUpload)}
                >
                  {showUpload ? '✕ Close Upload' : '📤 Upload Image'}
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('adminLoggedIn');
                    localStorage.removeItem('adminEmail');
                    setIsAdmin(false);
                    toast.success('Logged out');
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🚪 Logout
                </button>
              </div>
              
              {showUpload && (
                <div className="upload-form-pro">
                  <label className="upload-btn-pro">
                    {uploading ? '⏳ Uploading...' : '📤 Choose Image'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <span style={{ marginLeft: '15px', color: '#666' }}>
                      Please wait...
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            // ✅ Admin not logged in - Show choose image button
            <div className="upload-form-pro">
              <label className="upload-btn-pro">
                {uploading ? '⏳ Uploading...' : '📤 Choose Image'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <span style={{ marginLeft: '15px', color: '#666' }}>
                  Please wait...
                </span>
              )}
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* ADMIN LOGIN MODAL */}
        {/* ============================================ */}
        {showAdminLogin && (
          <div className="admin-login-modal">
            <div className="admin-login-modal-content">
              <h2>🔐 Admin Verification</h2>
              <p>Please enter admin credentials to upload images</p>
              
              <form onSubmit={handleAdminLogin}>
                <div className="form-group">
                  <label>Admin Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter admin email"
                    required
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Admin Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="submit" className="btn-confirm" disabled={adminLoading}>
                    {adminLoading ? '⏳ Verifying...' : '✅ Verify'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => {
                    setShowAdminLogin(false);
                    setPendingFile(null);
                  }}>
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="gallery-filters-pro">
          {categories.map(cat => (
            <button
              key={cat}
              className={activeCategory === cat ? 'filter-active-pro' : 'filter-btn-pro'}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid-pro">
          {filteredImages.length === 0 ? (
            <div className="empty-gallery-pro">
              <span>📭</span>
              <p>{isAdmin ? 'No images. Upload your first image!' : 'No images available'}</p>
            </div>
          ) : (
            filteredImages.map((image) => (
              <div 
                key={image.id} 
                className="gallery-item-pro"
                onClick={() => setSelectedImage(image)}
              >
                <div className="gallery-image-pro">
                  {image.url && image.url.startsWith('http') ? (
                    <img 
                      src={image.url} 
                      alt={image.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '🖼️';
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '60px' }}>{image.url || '🖼️'}</span>
                  )}
                </div>
                <div className="gallery-info-pro">
                  <h4>{image.title}</h4>
                  <span>{image.category}</span>
                </div>
                
                {/* Delete Button - Admin Only */}
                {isAdmin && (
                  <button 
                    className="admin-delete-btn-pro"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox-pro" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content-pro" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-pro" onClick={() => setSelectedImage(null)}>✕</button>
            {selectedImage.url && selectedImage.url.startsWith('http') ? (
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title}
                onError={(e) => {
                  e.target.alt = 'Image not found';
                }}
              />
            ) : (
              <div className="lightbox-icon">{selectedImage.url || '🖼️'}</div>
            )}
            <h3>{selectedImage.title}</h3>
            <span>{selectedImage.category}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;