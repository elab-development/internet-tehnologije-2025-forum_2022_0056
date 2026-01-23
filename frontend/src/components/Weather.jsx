import { useEffect, useState } from "react";

function Weather({ themeId }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/weather/theme/${themeId}`,
          { credentials: "include" }
        );

        if (!res.ok) return;

        const data = await res.json();
        setWeather(data.weather);
      } catch (err) {
        console.error("Weather error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [themeId]);

  if (loading) return <p>Loading weather...</p>;
  if (!weather) return <p>No weather data.</p>;

  return (
    <div style={{ marginTop: 10, fontSize: 14 }}>
      🌤 <strong>{weather.description}</strong><br />
      🌡 Temp: {weather.temperature} °C<br />
      💨 Wind: {weather.wind} m/s<br />
      💧 Humidity: {weather.humidity} %
    </div>
  );
}

export default Weather;
