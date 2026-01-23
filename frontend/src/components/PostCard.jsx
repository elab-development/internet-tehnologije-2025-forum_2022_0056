import React from "react";
import { useNavigate } from "react-router-dom";

function PostCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // kasnije može da vodi na detalje objave
    navigate(`/theme/${post.themeId}/post/${post.id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px 15px",
        marginBottom: "10px",
        cursor: "pointer",
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
    >
      <h3>{post.title}</h3>
      <p>{post.summary}</p>
    </div>
  );
}

export default PostCard;
