// src/components/pages/Gallery.jsx

import React, { useState, useEffect } from 'react';
import { uploadFileToS3 } from '../../aws/upload';
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Gallery.css';

const Gallery = () => {
  const { user } = useAuth();
  
  // ✅ Admin Check - localStorage
  const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
  
  // ✅ Also check email
  const adminEmails = ['admin@gmail.com', 'test@gmail.com', 'venkat@gmail.com'];
  const isAdminByEmail = adminEmails.includes(user?.email);
  const isAdminFinal = isAdmin || isAdminByEmail;

  console.log('👑 isAdmin (Storage):', isAdmin);
  console.log('👑 isAdmin (Email):', isAdminByEmail);
  console.log('👑 isAdmin (Final):', isAdminFinal);

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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
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
      e.target.value = '';
      setShowUpload(false);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
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
        
        {/* ✅ UPLOAD SECTION - ADMIN ONLY */}
        {isAdminFinal && (
          <div className="gallery-upload-pro">
            <button 
              className="upload-toggle-btn"
              onClick={() => setShowUpload(!showUpload)}
            >
              {showUpload ? '✕ Close Upload' : '📤 Upload Image'}
            </button>
            
            {showUpload && (
              <div className="upload-form-pro">
                <label className="upload-btn-pro">
                  {uploading ? '⏳ Uploading...' : '📤 Choose Image'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUpload}
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
              <p>{isAdminFinal ? 'No images. Upload your first image!' : 'No images available'}</p>
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
                {isAdminFinal && (
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