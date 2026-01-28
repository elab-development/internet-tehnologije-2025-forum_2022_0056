import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Weather from "../components/Weather";

export default function Home() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchThemes() {
      try {
        const res = await fetch("http://localhost:8000/api/themes");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (!data.themes) throw new Error("No themes field in response");

        setThemes(
          data.themes.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description || "Nema opisa",
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchThemes();
  }, []);

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <h3 style={styles.loadingText}>Učitavam teme...</h3>
    </div>
  );
  
  if (error) return (
    <div style={styles.errorContainer}>
      <div style={styles.errorIcon}>⚠️</div>
      <h2 style={styles.errorTitle}>Greška pri učitavanju</h2>
      <p style={styles.errorMessage}>{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        style={styles.retryButton}
      >
        Pokušaj ponovo
      </button>
    </div>
  );
  
  if (themes.length === 0) return (
    <div style={styles.emptyContainer}>
      <div style={styles.emptyIcon}>📝</div>
      <h2>Nema tema</h2>
      <p style={styles.emptyText}>Trenutno nema dostupnih tema za prikaz.</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* IMPROVED HEADER */}
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <h1 style={styles.mainTitle}>
            <span style={styles.titleIcon}>🏔️</span>
            Planinarski Forum
          </h1>
          <p style={styles.subtitle}>
            Istraži teme, podeli iskustva, pronađi tragove
          </p>
        </div>
        
        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>{themes.length}</span>
            <span style={styles.statLabel}>Tema</span>
          </div>
        </div>
      </div>

      {/* TEME - jedna ispod druge */}
      <div style={styles.themesList}>
        {themes.map((theme) => {
          const cardStyle = hoveredCard === theme.id 
            ? styles.themeCardHover 
            : styles.themeCard;

          return (
            <div
              key={theme.id}
              style={cardStyle}
              onClick={() => navigate(`/theme/${theme.id}`)}
              onMouseEnter={() => setHoveredCard(theme.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="theme-card"
            >
              <div style={styles.themeContent}>
                <h2 style={styles.themeTitle} className="theme-title">
                  {theme.name}
                </h2>
                <p style={styles.themeDescription} className="theme-description">
                  {theme.description}
                </p>
              </div>
              <Weather themeId={theme.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// STILOVI
const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px",
    background: "linear-gradient(135deg, #b9d6f4 0%, #f1f5f9 100%)",
    minHeight: "100vh",
  },

  // HEADER STYLES
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "30px 20px",
    background: "linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    border: "none",
    color: "white",
    position: "relative",
    overflow: "hidden",
  },

  titleContainer: {
    marginBottom: "20px",
    position: "relative",
    zIndex: "2",
  },

  mainTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "white",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    letterSpacing: "-0.5px",
    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },

  titleIcon: {
    fontSize: "3rem",
    filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.3))",
  },

  subtitle: {
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.85)",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
    fontStyle: "italic",
  },

  stats: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    marginTop: "25px",
    position: "relative",
    zIndex: "2",
  },

  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "15px 25px",
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    minWidth: "100px",
    transition: "all 0.3s ease",
    ":hover": {
      transform: "scale(1.05)",
      background: "rgba(255, 255, 255, 0.2)",
    },
  },

  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "5px",
    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },

  statLabel: {
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: "600",
  },

  // TEME - jedna ispod druge
  themesList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // Normalna kartica - JEDNA BOJA ZA SVE
  themeCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "14px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
    overflow: "hidden",
    // Blagi plavi akcent na levoj strani
    borderLeft: "4px solid #3498db",
  },

  // Hover kartica - JEDNA BOJA ZA SVE
  themeCardHover: {
    background: "linear-gradient(135deg, #f2e780f8 0%, #ffffff 100%)",
    borderRadius: "14px",
    padding: "25px",
    border: "1px solid #3498db",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
    overflow: "hidden",
    // Hover efekti
    transform: "translateY(-6px)",
    boxShadow: "0 12px 30px rgba(52, 152, 219, 0.2)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    borderLeft: "4px solid #2980b9",
    // Suptilna plava svetlost iza
    "::after": {
      content: '""',
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      height: "3px",
      background: "linear-gradient(90deg, #3498db, #2980b9, #1f639b)",
      animation: "shimmer 2s infinite",
    },
  },

  themeContent: {
    flex: "1",
    marginRight: "20px",
    position: "relative",
    zIndex: "1",
  },

  themeTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0 0 12px 0",
    transition: "all 0.3s ease",
  },

  themeDescription: {
    color: "#5d6d7e",
    lineHeight: "1.6",
    margin: "0",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },

  // LOADING STATES
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "20px",
  },

  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    color: "#7f8c8d",
    fontSize: "1.1rem",
  },

  // ERROR STATE
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center",
    padding: "40px",
  },

  errorIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
  },

  errorTitle: {
    color: "#e74c3c",
    marginBottom: "10px",
  },

  errorMessage: {
    color: "#7f8c8d",
    marginBottom: "25px",
    maxWidth: "500px",
  },

  retryButton: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "10px 25px",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      background: "#2980b9",
      transform: "translateY(-3px)",
      boxShadow: "0 5px 15px rgba(52, 152, 219, 0.3)",
    },
  },

  // EMPTY STATE
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
    opacity: "0.5",
  },

  emptyText: {
    color: "#7f8c8d",
    maxWidth: "400px",
  },
};
