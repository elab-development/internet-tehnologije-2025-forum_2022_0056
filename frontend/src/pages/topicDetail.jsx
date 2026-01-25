import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Weather from "../components/Weather";
import PostCard from "../components/PostCard";

function TopicDetail() {
  const { themeId } = useParams(); // dohvat ID teme iz URL-a
  const [theme, setTheme] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchThemeAndPosts() {
      try {
        const resTheme = await fetch(`http://localhost:8000/api/themes/${themeId}`, {
          credentials: "include",
        });
        if (!resTheme.ok) throw new Error("Failed to fetch theme");
        const themeData = await resTheme.json();

        const resPosts = await fetch(`http://localhost:8000/api/themes/${themeId}/posts`, {
          credentials: "include",
        });
        if (!resPosts.ok) throw new Error("Failed to fetch posts");
        const postsData = await resPosts.json();

        setTheme(themeData.theme);
        setPosts(postsData.posts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchThemeAndPosts();
  }, [themeId]);

  if (loading) return <h2>Loading theme details...</h2>;
  if (error) return <h2>Error: {error}</h2>;
  if (!theme) return <h2>Theme not found</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{theme.name}</h1>
      <p>{theme.description}</p>

      <Weather themeId={theme.id} />

      <h2>Objave u ovoj temi</h2>
      {posts.length === 0 && <p>Još nema objava.</p>}

      <div style={{ marginTop: '30px' }}>
  <h2 style={{ color: '#0d47a1', marginBottom: '20px' }}>
    📝 Objave u ovoj temi ({posts.length})
  </h2>
  
  {posts.length === 0 ? (
    <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '10px' }}>
      <p style={{ fontSize: '1.1rem', color: '#666' }}>Još nema objava u ovoj temi.</p>
      <button 
        onClick={() => alert('Prijavite se da biste objavili!')}
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
        Budite prvi koji će objaviti!
      </button>
    </div>
  ) : (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )}
</div>
    </div>
  );
}

export default TopicDetail;