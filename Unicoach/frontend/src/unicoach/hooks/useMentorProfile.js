import { useState, useEffect } from 'react';
import { getMentorProfile } from '../api/unicoachApi';

export const useMentorProfile = (handle) => {
  const [mentor, setMentor] = useState(null);
  const [services, setServices] = useState([]);
  const [ratingStats, setRatingStats] = useState({ averageRating: 5.0, totalReviews: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!handle) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getMentorProfile(handle);
      setMentor(data.mentor);
      setServices(data.services || []);
      setRatingStats(data.ratingStats || { averageRating: 5.0, totalReviews: 0 });
      setRecentReviews(data.recentReviews || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [handle]);

  return { 
    mentor, 
    services, 
    ratingStats, 
    recentReviews, 
    loading, 
    error, 
    refreshProfile: fetchProfile 
  };
};
