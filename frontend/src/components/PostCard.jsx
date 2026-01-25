// components/PostCard.jsx - AŽURIRAJTE
import React from "react";
import { useNavigate } from "react-router-dom";

function PostCard({ post }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Sada vodi na stranicu sa detaljima objave
    navigate(`/post/${post.id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "15px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: "white",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0, color: "#0d47a1" }}>{post.title}</h3>
        <span style={{ color: "#666", fontSize: "0.9rem" }}>
          {post.created_at ? new Date(post.created_at).toLocaleDateString('sr-RS') : ''}
        </span>
      </div>
      
      <p style={{ margin: "10px 0", color: "#555" }}>
        {post.content ? (post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content) : "Nema sadržaja"}
      </p>
      
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#777" }}>
        <span>👤 {post.author?.name || "Anoniman"}</span>
        <span>💬 {post.replies_count || 0} odgovora • 👍 {post.likes_count || 0}</span>
      </div>
    </div>
  );
}

export default PostCard;