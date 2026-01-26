import React from "react";
import { useNavigate } from "react-router-dom";
import LikeButton from "./LikeButton";

function PostCard({ post }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleLikeChange = (isLiked, newLikesCount) => {
    console.log(`Post ${post.id} ${isLiked ? 'laјkovan' : 'unlaјkovan'}. Novi broj laјkova: ${newLikesCount}`);
  };

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "15px",
        background: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
      }}
    >
      {/* Glavni sadržaj - klikabilan za otvaranje detalja */}
      <div onClick={handleCardClick} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <h3 style={{ margin: 0, color: "#0d47a1", fontSize: "1.2rem", flex: 1 }}>
            {post.title}
          </h3>
        </div>

        <p style={{ 
          margin: "10px 0", 
          color: "#555", 
          lineHeight: "1.5",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {post.content || "Nema sadržaja"}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", fontSize: "0.9rem", color: "#777" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "1rem" }}>👤</span>
              {post.author?.name || "Anoniman"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "1rem" }}>💬</span>
              {post.replies_count || 0}
            </span>
          </div>
          <span style={{ color: "#999" }}>
            {post.created_at ? new Date(post.created_at).toLocaleDateString('sr-RS') : ''}
          </span>
        </div>
      </div>

      {/* Like dugme - posebno da ne proklikava na detalje */}
      <div 
        style={{ 
          position: "absolute", 
          top: "20px", 
          right: "20px",
          zIndex: 2
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <LikeButton 
          postId={post.id} 
          initialLikes={post.likes_count || 0}
          isInitiallyLiked={post.likes && post.likes.length > 0}
          onLikeChange={handleLikeChange}
        />
      </div>
    </div>
  );
}

export default PostCard;