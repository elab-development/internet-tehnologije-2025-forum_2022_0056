import React, { useEffect, useState } from "react";

function WeatherInfo({ themeId }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!themeId) return;

    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/weather/theme/${themeId}`)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching weather:", err));
  }, [themeId]);

  if (loading) return <p>Loading weather...</p>;
  if (!weather) return <p>No weather data available</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Vreme za {themeId.name}</h2>
      <p>Temperatura: {weather.temperature}°C</p>
      <p>Vlažnost: {weather.humidity}%</p>
      <p>Opis: {weather.description}</p>
    </div>
  );
}

export default WeatherInfo;
