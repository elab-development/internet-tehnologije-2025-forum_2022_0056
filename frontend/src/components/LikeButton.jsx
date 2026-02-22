import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';

// Helper funkcija za čitanje cookie-ja
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    let cookieValue = parts.pop().split(';').shift();
    return decodeURIComponent(cookieValue);
  }
  return null;
}

function LikeButton({ postId, initialLikes = 0, isInitiallyLiked = false, onLikeChange }) {
  const { user } = useContext(UserContext);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showBurstAnimation, setShowBurstAnimation] = useState(false);

  // Ažuriraj kada se promene props
  useEffect(() => {
    setLikes(initialLikes);
    setIsLiked(isInitiallyLiked);
  }, [initialLikes, isInitiallyLiked]);

  const handleLikeClick = async () => {
    if (!user) {
      alert('Morate biti prijavljeni da biste lajkovali!');
      return;
    }

    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');

    try {
      // 1. Prvo uzmi CSRF cookie (kao u Login)
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        credentials: "include",
      });

      // 2. Sačekaj malo da se cookie sačuva
      await new Promise(resolve => setTimeout(resolve, 50));

      // 3. Uzmi XSRF token iz cookie-ja
      const xsrfToken = getCookie('XSRF-TOKEN');

      if (isLiked) {
        // UNLIKE
        const response = await fetch(`http://localhost:8000/api/posts/${postId}/like`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': xsrfToken,
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 419) {
            throw new Error('CSRF token expired - refresh page and try again');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Greška pri unlike-ovanju');
        }

        const result = await response.json();
        setLikes(result.likes_count);
        setIsLiked(false);
        
        if (onLikeChange) onLikeChange(false, result.likes_count);
        
      } else {
        // LIKE
        const response = await fetch(`http://localhost:8000/api/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': xsrfToken,
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 419) {
            throw new Error('CSRF token expired - refresh page and try again');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Greška pri lajkovanju');
        }

        const result = await response.json();
        
        // ANIMACIJE
        setShowHeartAnimation(true);
        setShowBurstAnimation(true);
        
        setLikes(result.likes_count);
        setIsLiked(true);
        
        if (onLikeChange) onLikeChange(true, result.likes_count);
        
        setTimeout(() => setShowHeartAnimation(false), 600);
        setTimeout(() => setShowBurstAnimation(false), 300);
      }
    } catch (err) {
      console.error('Greška pri lajkovanju:', err);
      setError(err.message);
      alert(err.message || 'Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  // Animacije (isti CSS)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* HEART FLOAT ANIMATION */}
      {showHeartAnimation && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '2.5rem',
          animation: 'floatUp 0.8s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 100,
          filter: 'drop-shadow(0 4px 8px rgba(255, 0, 0, 0.3))',
        }}>
          ❤️
        </div>
      )}

      {/* BURST ANIMATION */}
      {showBurstAnimation && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,68,68,0.3) 0%, rgba(255,68,68,0) 70%)',
          animation: 'burst 0.5s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 90,
        }} />
      )}

      {/* LIKE BUTTON */}
      <button
        onClick={handleLikeClick}
        disabled={loading || !user}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '25px',
          border: 'none',
          background: isLiked 
            ? 'linear-gradient(135deg, #ff4444, #ff6b6b)' 
            : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
          color: isLiked ? 'white' : '#666',
          fontWeight: 'bold',
          cursor: user ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: loading ? 0.7 : 1,
          minWidth: '100px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isLiked 
            ? '0 6px 20px rgba(255, 68, 68, 0.4)' 
            : '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <span style={{ 
          fontSize: '1.3rem',
          transition: 'transform 0.3s ease',
          transform: isLiked ? 'scale(1.2)' : 'scale(1)',
        }}>
          {isLiked ? '❤️' : '🤍'}
        </span>
        
        <span style={{ 
          minWidth: '25px', 
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: '600',
        }}>
          {likes}
        </span>
        
        {loading && (
          <span style={{ 
            fontSize: '0.8rem',
            animation: 'pulse 1.5s infinite',
            marginLeft: '5px'
          }}>
            ...
          </span>
        )}
      </button>
    </div>
  );
}

export default LikeButton;