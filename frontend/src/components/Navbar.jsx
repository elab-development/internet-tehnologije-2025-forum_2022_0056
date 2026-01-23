// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import React from "react";

function Navbar({ user }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="navbar-link">
          🏔 Planinarski Forum
        </Link>
      </div>

      <div className="navbar-menu">
        {!user && (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Register</Link>
          </>
        )}

        {user && (
          <>
            <span className="navbar-user">Hello, {user.name}</span>
            <Link to="/profile" className="navbar-link">Profile</Link>
            <Link to="/logout" className="navbar-link">Logout</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
