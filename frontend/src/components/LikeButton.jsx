// components/LikeButton.jsx - SA ANIMACIJAMA I EFEKTIMA
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';

function LikeButton({ postId, initialLikes = 0, isInitiallyLiked = false, onLikeChange }) {
  const { user } = useContext(UserContext);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ANIMACIJE
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showBurstAnimation, setShowBurstAnimation] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Pulse efekat kada se učita sa lajkom
  useEffect(() => {
    if (isInitiallyLiked) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitiallyLiked]);

  const handleLikeClick = async () => {
    if (!user) {
      alert('Morate biti prijavljeni da biste lajkovali!');
      return;
    }

    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');

    try {
      if (isLiked) {
        // UNLIKE - DELETE request
        const response = await fetch(`http://localhost:8000/api/posts/${postId}/like`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Greška pri unlike-ovanju');
        }

        setLikes(prev => prev - 1);
        setIsLiked(false);
        if (onLikeChange) onLikeChange(false, likes - 1);
        
      } else {
        // LIKE - POST request
        const response = await fetch(`http://localhost:8000/api/posts/${postId}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Greška pri lajkovanju');
        }

        // ANIMACIJE PRI LIKE-OVANJU
        setShowHeartAnimation(true);
        setShowBurstAnimation(true);
        
        setLikes(prev => prev + 1);
        setIsLiked(true);
        if (onLikeChange) onLikeChange(true, likes + 1);
        
        // Zaustavi animacije nakon vremena
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
          transform: pulse ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isLiked 
            ? '0 6px 20px rgba(255, 68, 68, 0.4)' 
            : '0 4px 12px rgba(0,0,0,0.1)',
        }}
        onMouseEnter={(e) => {
          if (user && !loading) {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.boxShadow = isLiked 
              ? '0 10px 25px rgba(255, 68, 68, 0.5)' 
              : '0 8px 20px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (user && !loading) {
            e.target.style.transform = pulse ? 'scale(1.05)' : 'scale(1)';
            e.target.style.boxShadow = isLiked 
              ? '0 6px 20px rgba(255, 68, 68, 0.4)' 
              : '0 4px 12px rgba(0,0,0,0.1)';
          }
        }}
      >
        {/* RIPPLE EFFECT */}
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '5px',
          height: '5px',
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          animation: isLiked && !loading ? 'ripple 1s ease-out' : 'none',
        }} />

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
          transition: 'all 0.3s ease',
          textShadow: isLiked ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
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
      
      {/* TOOLTIP ZA NEPRIJAVLJENE */}
      {!user && !loading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#333',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          marginTop: '8px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          opacity: 0,
          animation: 'fadeIn 0.3s ease forwards 0.5s',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}>
          Prijavi se da lajkuješ
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '6px solid #333',
          }} />
        </div>
      )}
      
      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #ff4444, #c62828)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          marginTop: '8px',
          zIndex: 10,
          animation: 'slideDown 0.3s ease',
          boxShadow: '0 4px 12px rgba(198, 40, 40, 0.3)',
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default LikeButton;