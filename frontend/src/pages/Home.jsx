import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Weather from "../components/Weather";

export default function Home() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (loading) return <h2 className="loading">Loading themes...</h2>;
  if (error) return <h2 className="error">Error: {error}</h2>;
  if (themes.length === 0) return <h2>No themes found</h2>;

  return (
    <div className="app-container">
      <h1>🏔 Planinarski Forum</h1>
      {themes.map((theme) => (
        <div
          key={theme.id}
          className="theme-card"
          onClick={() => navigate(`/theme/${theme.id}`)}
        >
          <div>
            <h2>{theme.name}</h2>
            <p>{theme.description}</p>
          </div>
          <Weather themeId={theme.id} />
        </div>
      ))}
    </div>
  );
}