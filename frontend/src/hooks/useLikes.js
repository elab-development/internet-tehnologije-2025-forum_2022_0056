import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export function useLikes() {
  const { user } = useContext(UserContext);
  const [userLikes, setUserLikes] = useState({}); // { postId: true/false }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllLikes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/likes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Pretvori u objekat: { postId: true/false }
        const likesMap = {};
        data.likes?.forEach(like => {
          const postId = like.post_id || like.post?.id;
          if (postId) {
            likesMap[postId] = true;
          }
        });
        
        setUserLikes(likesMap);
        console.log('Fetched all likes:', likesMap);
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLikes();
  }, [user]);

  return { userLikes, loading, error, refetch: fetchAllLikes };
}