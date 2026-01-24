// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

function Navbar() {
  const { user, logout } = useContext(UserContext);

  return (
    <nav className="navbar" style={navStyle}>
      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/" style={linkStyle}>
          🏔 Planinarski Forum
        </Link>
      </div>

      {/* Meni */}
      <div className="navbar-menu" style={menuStyle}>
        {!user && (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}

        {user && (
          <>
            <span style={userStyle}>Hello, {user.name}</span>

            {/* Dugme za kreiranje posta, samo ako user može da objavljuje */}
            {user.can_publish && (
              <Link to="/create-post" style={linkStyle}>New Post</Link>
            )}

            {/* Admin panel, samo ako je user admin */}
            {user.role === "admin" && (
              <Link to="/admin" style={linkStyle}>Admin Panel</Link>
            )}

            <Link to="/profile" style={linkStyle}>Profile</Link>

            {/* Logout */}
            <button onClick={logout} style={buttonStyle}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

/* --- Stilovi --- */
const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
  backgroundColor: "#0d47a1",
  color: "#fff",
};

const menuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "bold",
};

const userStyle = {
  fontWeight: "bold",
};

const buttonStyle = {
  padding: "5px 10px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#f44336",
  color: "#fff",
  fontWeight: "bold",
};
