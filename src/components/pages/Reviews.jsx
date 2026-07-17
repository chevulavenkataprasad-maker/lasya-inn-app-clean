import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getReviews, addReview } from '../../firebase/firestore';
import toast from 'react-hot-toast';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getReviews();
      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews([
          { id: '1', name: 'Ramesh Kumar', rating: 5, comment: 'Excellent stay! Clean rooms and friendly staff.', date: '2024-01-15' },
          { id: '2', name: 'Priya Sharma', rating: 4, comment: 'Good value for money. Comfortable rooms.', date: '2024-01-10' }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); return; }
    if (!newReview.comment.trim()) { toast.error('Please write a review'); return; }
    setSubmitting(true);
    try {
      await addReview({ name: user.displayName || 'Guest', rating: newReview.rating, comment: newReview.comment });
      toast.success('✅ Review submitted!');
      setNewReview({ rating: 5, comment: '' });
      await fetchReviews();
    } catch (error) {
      toast.error('Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  if (loading) {
    return <div className="reviews-loading-pro"><div className="spinner-pro"></div><p>Loading reviews...</p></div>;
  }

  return (
    <div className="reviews-page-pro">
      <div className="reviews-hero-pro">
        <h1>⭐ Guest Reviews</h1>
        <p>What our guests say about us</p>
      </div>

      <div className="reviews-container-pro">
        <div className="rating-summary-pro">
          <div className="rating-big-pro">{avg}<span>/5</span></div>
          <div className="rating-stars-pro">{renderStars(Math.round(avg))}</div>
          <div className="rating-count-pro">{reviews.length} reviews</div>
        </div>

        {user && (
          <div className="write-review-pro">
            <h3>✍️ Write a Review</h3>
            <form onSubmit={handleSubmit}>
              <div className="rating-select-pro">
                {[5,4,3,2,1].map(s => (
                  <button key={s} type="button" className={newReview.rating >= s ? 'active' : ''} onClick={() => setNewReview({...newReview, rating: s})}>⭐</button>
                ))}
              </div>
              <textarea placeholder="Share your experience..." rows="4" value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} required />
              <button type="submit" className="btn-submit-pro" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
            </form>
          </div>
        )}

        <div className="reviews-list-pro">
          {reviews.map((r) => (
            <div key={r.id} className="review-card-pro">
              <div className="review-header-pro">
                <span className="review-name-pro">{r.name}</span>
                <span>{renderStars(r.rating)}</span>
              </div>
              <p>{r.comment}</p>
              <span className="review-date-pro">📅 {r.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;