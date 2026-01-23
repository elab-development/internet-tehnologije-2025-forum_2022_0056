import React, { useEffect, useState } from "react";

function ThemeList({ onSelectTheme }) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/themes")
      .then((res) => res.json())
      .then((data) => {
        setThemes(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching themes:", err));
  }, []);

  if (loading) return <p>Loading themes...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Teme</h2>
      <ul>
        {themes.map((theme) => (
          <li
            key={theme.id}
            onClick={() => onSelectTheme(theme)}
            className="cursor-pointer mb-2 p-2 rounded hover:bg-gray-200"
          >
            {theme.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ThemeList;
