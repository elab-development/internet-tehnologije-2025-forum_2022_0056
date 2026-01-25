// pages/PostDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';

function PostDetail() {
  const { postId } = useParams(); // Uzimamo ID objave iz URL-a
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPostAndReplies() {
      try {
        // 1. Dohvati objavu
        const postRes = await fetch(`http://localhost:8000/api/posts/${postId}`);
        if (!postRes.ok) throw new Error('Failed to fetch post');
        const postData = await postRes.json();
        
        // 2. Dohvati odgovore (replies)
        const repliesRes = await fetch(`http://localhost:8000/api/posts/${postId}/replies`);
        const repliesData = await repliesRes.ok ? await repliesRes.json() : { replies: [] };

        setPost(postData.post || postData);
        setReplies(repliesData.replies || repliesData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPostAndReplies();
  }, [postId]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Učitavanje objave...</h2>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2 style={{ color: 'red' }}>Greška: {error}</h2>
      <Button onClick={() => navigate(-1)}>Nazad</Button>
    </div>
  );

  if (!post) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Objava nije pronađena</h2>
      <Link to="/">
        <Button>Vrati se na početnu</Button>
      </Link>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Navigacija */}
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>
          ← Nazad
        </Button>
        <Link to={`/theme/${post.theme_id}`}>
          <Button variant="outline">Vrati se na temu</Button>
        </Link>
      </div>

      {/* Glavna objava */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <h1 style={{ margin: 0, color: '#0d47a1' }}>{post.title}</h1>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>
            {new Date(post.created_at).toLocaleDateString('sr-RS')}
          </span>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <span style={{ fontWeight: 'bold', color: '#42a5f5' }}>
            Autor: {post.author?.name || 'Nepoznat'}
          </span>
          {post.author?.role === 'admin' && (
            <span style={{ marginLeft: '10px', background: '#ff7043', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
              ADMIN
            </span>
          )}
        </div>

        <div style={{
          padding: '20px',
          background: '#f9f9f9',
          borderRadius: '8px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap'
        }}>
          {post.content}
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <Button onClick={() => alert('Like funkcionalnost će biti dodata!')}>
            👍 {post.likes_count || 0}
          </Button>
          <Button onClick={() => alert('Odgovori će biti omogućeni nakon logina!')}>
            💬 Odgovori
          </Button>
          <Button variant="outline" onClick={() => alert('Deljenje će biti omogućeno!')}>
            📤 Podeli
          </Button>
        </div>
      </div>

      {/* Odgovori (replies) */}
      <div>
        <h2 style={{ color: '#0d47a1', marginBottom: '20px' }}>
          💬 Odgovori ({replies.length})
        </h2>

        {replies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
            <p>Još nema odgovora. Budite prvi koji će odgovoriti!</p>
            <Button onClick={() => alert('Prijavite se da biste odgovorili!')}>
              Dodaj odgovor
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {replies.map((reply) => (
              <div key={reply.id} style={{
                background: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #42a5f5'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold' }}>{reply.author?.name || 'Korisnik'}</span>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>
                    {new Date(reply.created_at).toLocaleDateString('sr-RS')}
                  </span>
                </div>
                <p style={{ margin: 0, lineHeight: '1.5' }}>{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetail;