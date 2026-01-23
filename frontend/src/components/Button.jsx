import React from "react";

function Button({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: "10px 18px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#42a5f5",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#1e88e5")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#42a5f5")}
    >
      {children}
    </button>
  );
}

export default Button;