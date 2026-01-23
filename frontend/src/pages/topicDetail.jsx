import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Weather from "../components/Weather";
import PostCard from "../components/PostCard";

function TopicDetail() {
  const { themeId } = useParams(); // dohvatimo ID teme iz URL-a
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

        setTheme(themeData);
        setPosts(postsData);
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

      {/* Weather komponenta */}
      <Weather themeId={theme.id} />

      <h2>Objave</h2>
      {posts.length === 0 && <p>Još nema objava u ovoj temi.</p>}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default TopicDetail;
