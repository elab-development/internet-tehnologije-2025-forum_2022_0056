// src/pages/CategoryDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Weather from "../components/Weather";
import PostCard from "../components/PostCard";

function CategoryDetail() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategoryAndThemes() {
      try {
        // Uzmi kategoriju
        const categoryRes = await fetch(
          `http://localhost:8000/api/categories/${categoryId}`
        );
        if (!categoryRes.ok) throw new Error("Failed to fetch category");
        const categoryData = await categoryRes.json();

        // Uzmi teme u ovoj kategoriji
        const themesRes = await fetch(
          `http://localhost:8000/api/categories/${categoryId}/themes`
        );
        if (!themesRes.ok) throw new Error("Failed to fetch themes");
        const themesData = await themesRes.json();

        setCategory(categoryData.category);
        setThemes(themesData.themes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryAndThemes();
  }, [categoryId]);

  if (loading) return <h2>Učitavam kategoriju...</h2>;
  if (error) return <h2>Greška: {error}</h2>;
  if (!category) return <h2>Kategorija nije pronađena</h2>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Navigacija */}
      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            background: "#42a5f5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          ← Nazad na kategorije
        </button>
      </div>

      {/* Zaglavlje kategorije */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "30px",
        color: "white",
        marginBottom: "30px",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)"
      }}>
        <h1 style={{ margin: "0 0 10px 0" }}>{category.name}</h1>
        <p style={{ margin: "0", opacity: 0.9 }}>{category.description}</p>
        <div style={{ marginTop: "15px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <span style={{
            background: "rgba(255,255,255,0.2)",
            padding: "5px 15px",
            borderRadius: "20px",
            fontSize: "0.9rem"
          }}>
            🏷️ {category.themes_count} tema
          </span>
          {/*{category.is_active && (
            <span style={{
              background: "#4caf50",
              padding: "5px 15px",
              borderRadius: "20px",
              fontSize: "0.9rem"
            }}>
              ✅ Aktivna
            </span>
          )}*/}
        </div>
      </div>

      {/* Teme u ovoj kategoriji */}
      <h2 style={{ color: "#0d47a1", marginBottom: "20px" }}>
        🗂️ Teme u ovoj kategoriji ({themes.length})
      </h2>

      {themes.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          background: "#f9f9f9",
          borderRadius: "10px",
          color: "#666"
        }}>
          <p style={{ fontSize: "1.1rem" }}>Još nema tema u ovoj kategoriji.</p>
          <button 
            onClick={() => alert('Samo administratori mogu dodavati teme!')}
            style={{
              padding: "10px 20px",
              background: "#42a5f5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Dodaj prvu temu
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {themes.map((theme) => (
            <div 
              key={theme.id} 
              className="theme-card"
              onClick={() => navigate(`/theme/${theme.id}`)}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderLeft: "4px solid #42a5f5"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: "0 0 10px 0", color: "#0d47a1" }}>{theme.name}</h3>
                  <p style={{ margin: 0, color: "#666" }}>{theme.description}</p>
                </div>
                <span style={{ 
                  background: "#e3f2fd", 
                  color: "#1976d2",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}>
                  {theme.posts_count} objava
                </span>
              </div>
              
              {/* Vremenska prognoza za ovu temu */}
              <div style={{ marginTop: "15px" }}>
                <Weather themeId={theme.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryDetail;