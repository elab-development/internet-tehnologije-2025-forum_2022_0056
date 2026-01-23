import React from "react";

function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column" }}>
      {label && <label style={{ marginBottom: "5px", fontWeight: 500 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "1rem",
          outline: "none",
          transition: "border 0.2s ease",
        }}
        onFocus={(e) => (e.target.style.border = "1px solid #42a5f5")}
        onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
      />
    </div>
  );
}

export default Input;