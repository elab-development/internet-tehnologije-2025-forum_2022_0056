import { useEffect, useState } from "react";
import Weather from "./components/Weather";


function App() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchThemes() {
      try {
        const res = await fetch("http://localhost:8000/api/themes", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();
        console.log("API RESPONSE:", data);

        // ⬇⬇⬇ OVO JE KLJUČ
        setThemes(data.themes);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchThemes();
  }, []);

  if (loading) return <h2>Loading themes...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Planinarski Forum</h1>

      {themes.length === 0 && <p>No themes found.</p>}

      {themes.map((theme) => (
        <div key={theme.id} className="theme-card">
          <h2>{theme.name}</h2>
          <p>{theme.description}</p>

          {theme.name === "Triglav" && (
            <Weather themeId={theme.id} />
          )}

        </div>
      ))}
    </div>
  );
}

export default App;
