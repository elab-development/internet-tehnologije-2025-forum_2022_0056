// pages/Profile.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import PostCard from '../components/PostCard';

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'likes', 'info'

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchUserData() {
      try {
        setLoading(true);
        
        // 1. Osnovni podaci (već imamo iz context-a, ali možemo osvežiti)
        const token = localStorage.getItem('token');
        const userRes = await fetch('http://localhost:8000/api/user', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include',
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserData(userData);
        }
        
        // 2. Dohvati korisnikove objave
        const postsRes = await fetch(`http://localhost:8000/api/posts?author_id=${user.id}`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setUserPosts(postsData.posts || []);
        }
        
      } catch (err) {
        console.error('Greška pri učitavanju profila:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user, navigate]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Niste prijavljeni</h2>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            background: '#42a5f5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Prijavi se
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Učitavanje profila...</h2>
      </div>
    );
  }

  const profileUser = userData || user;
  const initials = profileUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getRoleBadge = (role) => {
    const roles = {
      admin: { color: '#d32f2f', label: '👑 Administrator', icon: '👑' },
      moderator: { color: '#7b1fa2', label: '🛡️ Moderator', icon: '🛡️' },
      user: { color: '#1976d2', label: '👤 Korisnik', icon: '👤' }
    };
    
    return roles[role] || roles.user;
  };

  const roleInfo = getRoleBadge(profileUser.role);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Header sa nazad dugmetom */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          ← Nazad
        </button>
      </div>

      {/* PROFILE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #d1eef4 100%)',
        borderRadius: '16px',
        padding: '30px',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dekorativni elementi */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '25px' }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffffff, #f5f5f5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#764ba2',
            fontWeight: 'bold',
            fontSize: '2.5rem',
            boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            border: '4px solid white'
          }}>
            {initials}
          </div>

          {/* Informacije */}
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2.2rem' }}>
              {profileUser.name}
            </h1>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              flexWrap: 'wrap',
              marginBottom: '15px'
            }}>
              <span style={{
                background: roleInfo.color,
                color: 'white',
                padding: '6px 15px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {roleInfo.icon} {roleInfo.label}
              </span>
              
              
              
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              fontSize: '0.95rem',
              opacity: 0.9
            }}>
              
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                📅 Član od: {new Date().toLocaleDateString('sr-RS')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIKE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#42a5f5', marginBottom: '10px' }}>📝</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0d47a1' }}>
            {userPosts.length}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Objave</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#66bb6a', marginBottom: '10px' }}>💬</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0d47a1' }}>
            {profileUser.replies_count || 0}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Odgovori</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#ff7043', marginBottom: '10px' }}>❤️</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0d47a1' }}>
            {profileUser.likes_count || 0}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Lajkovi</div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: '#ab47bc', marginBottom: '10px' }}>🏆</div>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0d47a1' }}>
            {profileUser.role === 'admin' ? 'Admin' : 
             profileUser.role === 'moderator' ? 'Moderator' : 'Član'}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Status</div>
        </div>
      </div>

      {/* TAB NAVIGACIJA */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e0e0e0',
        marginBottom: '25px',
        gap: '5px'
      }}>
        <button
          onClick={() => setActiveTab('posts')}
          style={{
            padding: '12px 25px',
            background: activeTab === 'posts' ? '#42a5f5' : 'transparent',
            color: activeTab === 'posts' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'posts' ? '3px solid #42a5f5' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease'
          }}
        >
          📝 Moje objave ({userPosts.length})
        </button>
        
        <button
          onClick={() => setActiveTab('likes')}
          style={{
            padding: '12px 25px',
            background: activeTab === 'likes' ? '#ff4444' : 'transparent',
            color: activeTab === 'likes' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'likes' ? '3px solid #ff4444' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease'
          }}
        >
          ❤️ Lajkovano ({profileUser.liked_posts_count || 0})
        </button>
        
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '12px 25px',
            background: activeTab === 'info' ? '#66bb6a' : 'transparent',
            color: activeTab === 'info' ? 'white' : '#666',
            border: 'none',
            borderBottom: activeTab === 'info' ? '3px solid #66bb6a' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease'
          }}
        >
          ℹ️ Informacije
        </button>
      </div>

      {/* TAB SADRŽAJ */}
      <div>
        {activeTab === 'posts' && (
          <div>
            {userPosts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                background: '#f9f9f9',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📝</div>
                <h3 style={{ color: '#666' }}>Još niste objavili ništa</h3>
                <p style={{ color: '#999', marginBottom: '20px' }}>
                  Podelite svoje prvo iskustvo ili postavite pitanje!
                </p>
                <button
                  onClick={() => navigate('/create-post')}
                  style={{
                    padding: '12px 25px',
                    background: '#42a5f5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  ➕ Kreiraj prvu objavu
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ marginBottom: '20px', color: '#0d47a1' }}>
                  Vaše objave ({userPosts.length})
                </h3>
                <div>
                  {userPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: '#f9f9f9',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❤️</div>
            <h3 style={{ color: '#666' }}>Lista lajkovanih objava</h3>
            <p style={{ color: '#999' }}>
              Ova funkcionalnost će biti dodata u narednoj verziji.
            </p>
          </div>
        )}

        {activeTab === 'info' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#0d47a1' }}>📋 Detalji naloga</h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                  Ime i prezime
                </label>
                <div style={{
                  padding: '12px 15px',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {profileUser.name}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                  Email adresa
                </label>
                <div style={{
                  padding: '12px 15px',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}>
                  {profileUser.email}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                  Uloga na forumu
                </label>
                <div style={{
                  padding: '12px 15px',
                  background: roleInfo.color + '20',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: roleInfo.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {roleInfo.icon} {roleInfo.label}
                </div>
              </div>

              {profileUser.can_publish !== undefined && (
                <div>
                  <label style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>
                    Prava objavljivanja
                  </label>
                  <div style={{
                    padding: '12px 15px',
                    background: profileUser.can_publish ? '#e8f5e9' : '#ffebee',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    color: profileUser.can_publish ? '#2e7d32' : '#c62828',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {profileUser.can_publish ? '✅ Može da objavljuje' : '❌ Ne može da objavljuje'}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button
                onClick={logout}
                style={{
                  padding: '12px 25px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🚪 Odjavi se
              </button>
              
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 25px',
                  background: 'transparent',
                  color: '#42a5f5',
                  border: '2px solid #42a5f5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Vrati se na forum
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;