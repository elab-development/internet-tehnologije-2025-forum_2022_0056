import { useEffect, useState } from "react";
import Weather from "./components/Weather";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import TopicDetail from "./pages/topicDetail";
import Navbar from "./components/Navbar";


function App() {
  return (
    <Router>
      <Navbar user={null} />
      <Routes>
        {/* Početna stranica */}
        <Route path="/" element={<Home />} />

        {/* Stranica detalja teme */}
        <Route path="/theme/:themeId" element={<TopicDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

function Home() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // hook za navigaciju

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
        <div
          key={theme.id}
          className="theme-card"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
          onClick={() => navigate(`/theme/${theme.id}`)} // klik vodi na detalje teme
        >
          <div>
            <h2>{theme.name}</h2>
            <p>{theme.description}</p>
          </div>

          {/* Render Weather komponentu za svaku temu */}
          {theme.id && <Weather themeId={theme.id} />}
        </div>
      ))}
    </div>
  );
}