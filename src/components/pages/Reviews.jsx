// src/components/pages/Reviews.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getReviews, addReview, listenReviews } from '../../firebase/firestore';
import toast from 'react-hot-toast';
import './Reviews.css';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);

  // ============================================
  // ✅ REAL-TIME REVIEWS LISTENER
  // ============================================
  useEffect(() => {
    console.log('🔄 Setting up real-time reviews listener...');
    
    const unsubscribe = listenReviews((updatedReviews) => {
      console.log('🔄 Reviews updated in real-time:', updatedReviews);
      setReviews(updatedReviews);
      setLoading(false);
    });

    return () => {
      console.log('🔄 Cleaning up reviews listener...');
      unsubscribe();
    };
  }, []);

  // ============================================
  // ADD REVIEW
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }
    
    if (!newReview.comment.trim()) {
      toast.error('Please write a review');
      return;
    }
    
    setSubmitting(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.displayName || 'Guest',
        userEmail: user.email,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        createdAt: new Date().toISOString()
      };

      await addReview(reviewData);
      toast.success('✅ Review submitted successfully!');
      setNewReview({ rating: 5, comment: '' });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ REVIEW CLICK HANDLER - For mobile
  // ============================================
  const handleReviewClick = (review) => {
    console.log('📱 Review clicked:', review);
    setSelectedReview(review);
  };

  const closeModal = () => {
    setSelectedReview(null);
  };

  // ============================================
  // RENDER STARS
  // ============================================
  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // ============================================
  // CALCULATE AVERAGE RATING
  // ============================================
  const avg = reviews.length > 0 
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="reviews-loading-pro">
        <div className="spinner-pro"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="reviews-page-pro">
      
      {/* Hero Section */}
      <div className="reviews-hero-pro">
        <h1>⭐ Guest Reviews</h1>
        <p>What our guests say about us</p>
      </div>

      <div className="reviews-container-pro">
        
        {/* Rating Summary */}
        <div className="rating-summary-pro">
          <div className="rating-big-pro">
            {avg} <span>/5</span>
          </div>
          <div className="rating-stars-pro">
            {renderStars(Math.round(avg))}
          </div>
          <div className="rating-count-pro">
            {reviews.length} reviews
          </div>
        </div>

        {/* Write Review - Only for logged in users */}
        {user ? (
          <div className="write-review-pro">
            <h3>✍️ Write a Review</h3>
            <form onSubmit={handleSubmit}>
              <div className="rating-select-pro">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= (hoverRating || newReview.rating) ? 'active' : ''}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Share your experience..."
                rows="4"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
              />
              <button 
                type="submit" 
                className="btn-submit-pro" 
                disabled={submitting}
              >
                {submitting ? '⏳ Submitting...' : '⭐ Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className="login-to-review">
            <p>Please <Link to="/login">login</Link> to leave a review</p>
          </div>
        )}

        {/* Reviews List - Clickable for mobile */}
        <div className="reviews-list-pro">
          {reviews.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((r) => (
              <div 
                key={r.id} 
                className="review-card-pro"
                onClick={() => handleReviewClick(r)}
                style={{ cursor: 'pointer' }}
              >
                <div className="review-header-pro">
                  <span className="review-name-pro">👤 {r.userName || r.name}</span>
                  <span className="review-date-pro">
                    {r.createdAt || r.date ? (
                      new Date(r.createdAt || r.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    ) : (
                      'Recent'
                    )}
                  </span>
                </div>
                <div className="review-stars-pro">
                  {renderStars(r.rating)}
                </div>
                <p className="review-comment">{r.comment}</p>
                <div className="review-click-hint">👆 Tap to view full</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* ✅ REVIEW DETAIL MODAL - For mobile click */}
      {/* ============================================ */}
      {selectedReview && (
        <div className="review-modal-overlay" onClick={closeModal}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="review-modal-close" onClick={closeModal}>✕</button>
            <div className="review-modal-header">
              <span className="review-modal-name">👤 {selectedReview.userName || selectedReview.name}</span>
              <span className="review-modal-date">
                {selectedReview.createdAt || selectedReview.date ? (
                  new Date(selectedReview.createdAt || selectedReview.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                ) : (
                  'Recent'
                )}
              </span>
            </div>
            <div className="review-modal-stars">
              {renderStars(selectedReview.rating)}
            </div>
            <p className="review-modal-comment">{selectedReview.comment}</p>
            <div className="review-modal-footer">
              <span>⭐ {selectedReview.rating}/5</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;