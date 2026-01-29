// src/components/Navbar.jsx - SAMO ZAOBLJENE IVICE NA NAVBARU
import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

function Navbar() {
  const { user, logout } = useContext(UserContext);

  return (
    <nav style={styles.navbar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <Link to="/" style={styles.logoLink}>
          <span style={styles.logoIcon}>🏔️</span>
          <span style={styles.logoText}>
            <span style={styles.logoMain}>Planinarski Forum</span>
            <span style={styles.logoSub}>connect & explore</span>
          </span>
        </Link>
      </div>

      {/* Meni */}
      <div style={styles.menu}>
        {!user ? (
          <>
            {/*<Link to="/" style={linkStyle}>Početna</Link>*/}
            <Link to="/login" style={styles.navLink}>
              <span style={styles.linkIcon}>🔑</span>
              Prijava
            </Link>
            <Link to="/register" style={styles.navButton}>
              <span style={styles.linkIcon}>📝</span>
              Registracija
            </Link>
          </>
        ) : (
          <>
            {/* Role badge - samo ikona */}
            {/*<div style={styles.userInfo}>
              {user.role === "admin" && (
                <span style={styles.roleBadge.admin} title="Administrator">
                  👑
                </span>
              )}
              {user.role === "moderator" && (
                <span style={styles.roleBadge.moderator} title="Moderator">
                  🛡️
                </span>
              )}
            </div>*/}

            {/* Akcioni dugmici */}
            <div style={styles.actionButtons}>
              {user.can_publish && (
                <Link to="/create-post" style={styles.actionButton.primary}>
                  <span style={styles.buttonIcon}>✏️</span>
                  Nova Objava
                </Link>
              )}

              {user.role === "admin" && (
                <Link to="/admin" style={styles.actionButton.admin}>
                  <span style={styles.buttonIcon}>⚙️</span>
                  Admin
                </Link>
              )}

              <Link to="/profile" style={styles.actionButton.profile}>
                <span style={styles.buttonIcon}>👤</span>
                Profil
              </Link>

              <button onClick={logout} style={styles.logoutButton}>
                <span style={styles.buttonIcon}>🚪</span>
                Izlaz
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

// STILOVI - SAMO NAVBAR ZAOBLJEN
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 24px",
    background: "linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)",
    color: "white",
    boxShadow: "0 3px 15px rgba(0, 0, 0, 0.2)",
    position: "sticky",
    top: "10px", /* Dodaj margin od vrha */
    zIndex: 100,
    borderBottom: "3px solid #3498db",
    minHeight: "65px",
    // ZAOBLJENE IVICE - OVO JE PROMENA
    borderRadius: "16px", // Povećano za mekši izgled
    margin: "10px 20px 0 20px", // Da ne bude uz sam vrh
  },

  // Ostali stilovi ostaju isti...
  logoSection: {
    display: "flex",
    alignItems: "center",
  },

  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "inherit",
    padding: "5px 0",
  },

  logoIcon: {
    fontSize: "2rem",
    filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
  },

  logoText: {
    display: "flex",
    flexDirection: "column",
  },

  logoMain: {
    fontSize: "1.3rem",
    fontWeight: "700",
    letterSpacing: "0.5px",
    color: "#ecf0f1",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
  },

  logoSub: {
    fontSize: "0.75rem",
    opacity: 0.85,
    marginTop: "2px",
    fontStyle: "italic",
  },

  menu: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    padding: "6px",
  },

  roleBadge: {
    admin: {
      background: "linear-gradient(135deg, #e74c3c, #c0392b)",
      color: "white",
      padding: "8px",
      borderRadius: "50%",
      fontSize: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      boxShadow: "0 2px 5px rgba(231, 76, 60, 0.3)",
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        transform: "scale(1.1)",
        boxShadow: "0 3px 8px rgba(231, 76, 60, 0.4)",
      },
    },
    moderator: {
      background: "linear-gradient(135deg, #9b59b6, #8e44ad)",
      color: "white",
      padding: "8px",
      borderRadius: "50%",
      fontSize: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      boxShadow: "0 2px 5px rgba(155, 89, 182, 0.3)",
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        transform: "scale(1.1)",
        boxShadow: "0 3px 8px rgba(155, 89, 182, 0.4)",
      },
    },
  },

  navLink: {
    color: "#ecf0f1",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "8px", // Dugmad ostaju zaobljena
    fontWeight: "500",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transform: "translateY(-1px)",
    },
  },

  navButton: {
    background: "linear-gradient(to right, #2ecc71, #27ae60)",
    color: "white",
    textDecoration: "none",
    padding: "8px 18px",
    borderRadius: "8px", // Dugmad ostaju zaobljena
    fontWeight: "600",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 5px rgba(46, 204, 113, 0.3)",
    ":hover": {
      background: "linear-gradient(to right, #27ae60, #219653)",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(46, 204, 113, 0.4)",
    },
  },

  actionButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  actionButton: {
    primary: {
      background: "linear-gradient(135deg, #3498db, #2980b9)",
      color: "white",
      textDecoration: "none",
      padding: "8px 16px",
      borderRadius: "8px", // Dugmad ostaju zaobljena
      fontSize: "0.9rem",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 5px rgba(52, 152, 219, 0.3)",
      ":hover": {
        background: "linear-gradient(135deg, #2980b9, #1f639b)",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(52, 152, 219, 0.4)",
      },
    },
    admin: {
      background: "linear-gradient(135deg, #e67e22, #d35400)",
      color: "white",
      textDecoration: "none",
      padding: "8px 14px",
      borderRadius: "8px", // Dugmad ostaju zaobljena
      fontSize: "0.9rem",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.2s ease",
      ":hover": {
        background: "linear-gradient(135deg, #d35400, #ba4a00)",
        transform: "translateY(-2px)",
      },
    },
    profile: {
      background: "transparent",
      color: "#ecf0f1",
      textDecoration: "none",
      padding: "8px 14px",
      borderRadius: "8px", // Dugmad ostaju zaobljena
      fontSize: "0.9rem",
      fontWeight: "500",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.2s ease",
      ":hover": {
        background: "rgba(255, 255, 255, 0.1)",
        borderColor: "#3498db",
        transform: "translateY(-1px)",
      },
    },
  },

  logoutButton: {
    background: "linear-gradient(135deg, #7f8c8d, #95a5a6)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px", // Dugmad ostaju zaobljena
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    ":hover": {
      background: "linear-gradient(135deg, #95a5a6, #7f8c8d)",
      transform: "translateY(-2px)",
      boxShadow: "0 2px 5px rgba(127, 140, 141, 0.3)",
    },
  },

  linkIcon: {
    fontSize: "0.9rem",
  },

  buttonIcon: {
    fontSize: "0.95rem",
  },
};

export default Navbar;