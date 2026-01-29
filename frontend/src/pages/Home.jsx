// src/pages/Home.jsx - KOMPLETNO NOVO
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Weather from "../components/Weather";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:8000/api/categories");
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        
        if (!data.categories) throw new Error("No categories field in response");

        setCategories(data.categories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) return <h2 className="loading">Učitavam kategorije...</h2>;
  if (error) return <h2 className="error">Greška: {error}</h2>;
  if (categories.length === 0) return <h2>Nema kategorija</h2>;

  return (
    <div className="app-container">
      <h1>🏔️ Planinarski Forum</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
        Dobrodošli na najveći planinarski forum! Izaberite kategoriju i počnite diskusiju.
      </p>
      
      {categories.map((category) => (
        <div key={category.id} className="category-card">
          <div className="category-header">
            <h2>{category.name}</h2>
            <span className="theme-count">
              {category.themes_count} {category.themes_count === 1 ? 'tema' : 'tema'}
            </span>
          </div>
          
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
          
          {/* Dugme za pregled svih tema u kategoriji */}
          <button 
            className="view-themes-btn"
            onClick={() => navigate(`/category/${category.id}`)}
          >
            👁️ Pregledaj sve teme
          </button>
        </div>
      ))}
    </div>
  );
}