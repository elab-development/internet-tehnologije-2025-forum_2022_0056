import React from "react";

function Button({ children, onClick, type = "button", variant = "primary" }) {
  const variantStyles = {
    primary: {
      backgroundColor: "#42a5f5",
      color: "#fff",
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#42a5f5",
      border: "2px solid #42a5f5",
    },
    danger: {
      backgroundColor: "#f44336",
      color: "#fff",
      border: "none",
    }
  };

  const baseStyle = {
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const selectedStyle = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...selectedStyle,
      }}
      onMouseEnter={(e) => {
        if (variant === "outline") {
          e.target.style.backgroundColor = "#42a5f5";
          e.target.style.color = "white";
        } else {
          e.target.style.opacity = "0.9";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "outline") {
          e.target.style.backgroundColor = "transparent";
          e.target.style.color = "#42a5f5";
        } else {
          e.target.style.opacity = "1";
        }
      }}
    >
      {children}
    </button>
  );
}

export default Button;