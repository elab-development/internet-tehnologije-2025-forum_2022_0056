// pages/PostDetail.jsx - DODATA FUNKCIONALNOST ZA ODGOVARANJE
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Button from '../components/Button';
import LikeButton from '../components/LikeButton';
import Input from '../components/Input';

function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // Osveži podatke o objavi
  const refreshPost = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post || data);
      }
    } catch (err) {
      console.error('Greška pri osvežavanju:', err);
    }
  };

  // Osveži odgovore
  const refreshReplies = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}/replies`);
      if (res.ok) {
        const data = await res.json();
        setReplies(data.replies || data || []);
      }
    } catch (err) {
      console.error('Greška pri osvežavanju odgovora:', err);
    }
  };

  // Učitaj sve podatke
  useEffect(() => {
    async function fetchPostAndReplies() {
      try {
        setLoading(true);
        await Promise.all([refreshPost(), refreshReplies()]);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPostAndReplies();
  }, [postId]);

  // Funkcija za slanje odgovora
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Morate biti prijavljeni da biste odgovorili!');
      navigate('/login');
      return;
    }

    if (!replyContent.trim()) {
      alert('Unesite sadržaj odgovora!');
      return;
    }

    setReplying(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: `Re: ${post?.title || 'Objava'}`,
          content: replyContent,
          theme_id: post?.theme_id || post?.theme?.id,
          replied_to_id: parseInt(postId),
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri slanju odgovora');
      }

      // Resetuj formu
      setReplyContent('');
      setShowReplyForm(false);
      
      // Osveži odgovore i objavu
      await Promise.all([refreshReplies(), refreshPost()]);
      
      // Scroll to new reply
      setTimeout(() => {
        const repliesSection = document.getElementById('replies-section');
        if (repliesSection) {
          repliesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err) {
      console.error('Greška pri odgovaranju:', err);
      alert(err.message || 'Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setReplying(false);
    }
  };

  const handleLikeChange = (isLiked, newLikesCount) => {
    refreshPost();
    
    if (post) {
      setPost({
        ...post,
        likes_count: newLikesCount,
        likes: isLiked ? [{ id: Date.now() }] : []
      });
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <h2>Učitavanje objave...</h2>
    </div>
  );

  if (error) return (
    <div style={styles.errorContainer}>
      <h2 style={{ color: 'red' }}>Greška: {error}</h2>
      <Button onClick={() => navigate(-1)}>Nazad</Button>
    </div>
  );

  if (!post) return (
    <div style={styles.notFoundContainer}>
      <h2>Objava nije pronađena</h2>
      <Link to="/">
        <Button>Vrati se na početnu</Button>
      </Link>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Navigacija */}
      <div style={styles.navigation}>
        <Button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Nazad
        </Button>
        
      </div>

      {/* Glavna objava */}
      <div style={styles.postCard}>
        <div style={styles.postHeader}>
          <h1 style={styles.postTitle}>{post.title}</h1>
          <span style={styles.postDate}>
            {post.created_at ? new Date(post.created_at).toLocaleDateString('sr-RS', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : ''}
          </span>
        </div>

        <div style={styles.authorSection}>
          <span style={styles.authorName}>
            <span style={styles.authorIcon}>👤</span>
            {post.author?.name || 'Nepoznat'}
          </span>
          {post.author?.role === 'admin' && (
            <span style={styles.adminBadge}>
              👑 ADMIN
            </span>
          )}
          {post.author?.role === 'moderator' && (
            <span style={styles.moderatorBadge}>
              🛡️ MODERATOR
            </span>
          )}
        </div>

        <div style={styles.postContent}>
          {post.content}
        </div>

        {/* Action buttons */}
        <div style={styles.actionButtons}>
          <LikeButton 
            postId={post.id} 
            initialLikes={post.likes_count || 0}
            isInitiallyLiked={post.likes && post.likes.length > 0}
            onLikeChange={handleLikeChange}
          />

          <Button 
            onClick={() => setShowReplyForm(!showReplyForm)}
            style={styles.replyButton}
          >
            <span style={styles.buttonIcon}>💬</span>
            Odgovori ({post.replies_count || replies.length || 0})
          </Button>

          <Button onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: post.title,
                text: post.content.substring(0, 100) + '...',
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link kopiran u clipboard!');
            }
          }}>
            <span style={styles.buttonIcon}>📤</span>
            Podeli
          </Button>
        </div>
      </div>

      {/* FORMULAR ZA ODGOVOR */}
      {showReplyForm && (
        <div style={styles.replyFormContainer}>
          <h3 style={styles.replyFormTitle}>
            <span style={styles.replyIcon}>✏️</span>
            Odgovori na ovu objavu
          </h3>
          
          <form onSubmit={handleSubmitReply}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Vaš odgovor {!user && <span style={styles.required}>(Morate biti prijavljeni)</span>}
              </label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Napišite svoj odgovor..."
                rows="5"
                disabled={!user || replying}
                style={styles.replyTextarea}
                required
              />
              <div style={styles.charCount}>
                {replyContent.length} / 1000 karaktera
              </div>
            </div>

            <div style={styles.formActions}>
              <Button
                type="submit"
                disabled={!user || replying || !replyContent.trim()}
                style={styles.submitButton}
              >
                {replying ? (
                  <>
                    <span style={styles.buttonIcon}>⏳</span>
                    Šaljem...
                  </>
                ) : (
                  <>
                    <span style={styles.buttonIcon}>📤</span>
                    Pošalji odgovor
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                variant="outline"
                disabled={replying}
              >
                Otkaži
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Odgovori (replies) */}
      <div id="replies-section" style={styles.repliesSection}>
        <div style={styles.repliesHeader}>
          <h2 style={styles.repliesTitle}>
            <span style={styles.repliesIcon}>💬</span>
            Odgovori ({replies.length})
          </h2>
          
          {replies.length === 0 && !showReplyForm && (
            <Button 
              onClick={() => setShowReplyForm(true)}
              style={styles.firstReplyButton}
            >
              <span style={styles.buttonIcon}>✏️</span>
              Budite prvi koji će odgovoriti!
            </Button>
          )}
        </div>

        {replies.length === 0 ? (
          <div style={styles.noReplies}>
            <p style={styles.noRepliesText}>Još nema odgovora.</p>
            {!showReplyForm && (
              <Button onClick={() => setShowReplyForm(true)}>
                Dodaj odgovor
              </Button>
            )}
          </div>
        ) : (
          <div style={styles.repliesList}>
            {replies.map((reply) => (
              <div key={reply.id} style={styles.replyCard}>
                <div style={styles.replyHeader}>
                  <div style={styles.replyAuthor}>
                    <span style={styles.replyAuthorIcon}>👤</span>
                    <strong>{reply.author?.name || 'Korisnik'}</strong>
                    {reply.author?.role === 'admin' && (
                      <span style={styles.smallAdminBadge}>👑</span>
                    )}
                    {reply.author?.role === 'moderator' && (
                      <span style={styles.smallModBadge}>🛡️</span>
                    )}
                  </div>
                  <span style={styles.replyDate}>
                    {reply.created_at ? new Date(reply.created_at).toLocaleDateString('sr-RS', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </span>
                </div>
                
                <div style={styles.replyContent}>
                  {reply.content}
                </div>
                
                <div style={styles.replyActions}>
                  <LikeButton 
                    postId={reply.id}
                    initialLikes={reply.likes_count || 0}
                    isInitiallyLiked={reply.likes && reply.likes.length > 0}
                    small={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// STILOVI
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },

  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
  },

  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },

  errorContainer: {
    textAlign: 'center',
    padding: '40px 20px',
  },

  notFoundContainer: {
    textAlign: 'center',
    padding: '40px 20px',
  },

  navigation: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },

  backButton: {
    marginRight: '10px',
  },

  postCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '30px',
    border: '1px solid #e0e0e0',
  },

  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },

  postTitle: {
    margin: 0,
    color: '#1a237e',
    fontSize: '1.8rem',
    flex: 1,
  },

  postDate: {
    color: '#666',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },

  authorSection: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },

  authorIcon: {
    marginRight: '8px',
  },

  authorName: {
    fontWeight: '600',
    color: '#333',
    fontSize: '1.1rem',
  },

  adminBadge: {
    background: 'linear-gradient(135deg, #d32f2f, #c62828)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },

  moderatorBadge: {
    background: 'linear-gradient(135deg, #7b1fa2, #6a1b9a)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },

  postContent: {
    padding: '25px',
    background: '#f8f9fa',
    borderRadius: '10px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    fontSize: '1.05rem',
    marginBottom: '25px',
    border: '1px solid #e9ecef',
  },

  actionButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  replyButton: {
    background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
  },

  buttonIcon: {
    marginRight: '8px',
  },

  // Reply Form Styles
  replyFormContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '30px',
    border: '2px solid #e3f2fd',
  },

  replyFormTitle: {
    margin: '0 0 20px 0',
    color: '#1a237e',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  replyIcon: {
    fontSize: '1.2rem',
  },

  formGroup: {
    marginBottom: '20px',
  },

  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
  },

  required: {
    color: '#d32f2f',
    fontSize: '0.9rem',
    marginLeft: '5px',
  },

  replyTextarea: {
    width: '100%',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    resize: 'vertical',
    minHeight: '120px',
    boxSizing: 'border-box',
    transition: 'border 0.2s ease',
  },

  replyTextareaFocus: {
    border: '1px solid #3498db',
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)',
  },

  charCount: {
    textAlign: 'right',
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '5px',
  },

  formActions: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
  },

  submitButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
  },

  // Replies Section
  repliesSection: {
    marginTop: '40px',
  },

  repliesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },

  repliesTitle: {
    margin: 0,
    color: '#1a237e',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  repliesIcon: {
    fontSize: '1.3rem',
  },

  firstReplyButton: {
    background: 'linear-gradient(135deg, #ff9800, #f57c00)',
  },

  noReplies: {
    textAlign: 'center',
    padding: '40px 20px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '2px dashed #dee2e6',
  },

  noRepliesText: {
    color: '#666',
    marginBottom: '20px',
    fontSize: '1.1rem',
  },

  // Replies List
  repliesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  replyCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #e0e0e0',
    borderLeft: '4px solid #42a5f5',
    transition: 'transform 0.2s ease',
  },

  replyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },

  replyAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1rem',
  },

  replyAuthorIcon: {
    fontSize: '0.9rem',
  },

  smallAdminBadge: {
    background: '#ffebee',
    color: '#d32f2f',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },

  smallModBadge: {
    background: '#f3e5f5',
    color: '#7b1fa2',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },

  replyDate: {
    color: '#888',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },

  replyContent: {
    lineHeight: '1.5',
    color: '#333',
    marginBottom: '15px',
    whiteSpace: 'pre-wrap',
  },

  replyActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

// Dodaj animaciju za spinner
const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Dodaj globalne stilove
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = spinAnimation;
  document.head.appendChild(style);
}

export default PostDetail;