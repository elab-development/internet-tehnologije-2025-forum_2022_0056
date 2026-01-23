import { useEffect, useState } from "react";

function Weather({ themeId }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!themeId) return;

    setLoading(true);

    fetch(`http://localhost:8000/api/weather/theme/${themeId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Weather API error");
        return res.json();
      })
      .then((data) => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [themeId]);

  if (loading) return <p>Loading weather...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!weatherData) return null;

  return (
    <div className="weather-card">
      <h3>{weatherData.location}</h3>
      <p>🌡 Temperature: {weatherData.weather.temperature} °C</p>
      <p>🤒 Feels like: {weatherData.weather.feels_like} °C</p>
      <p>💧 Humidity: {weatherData.weather.humidity} %</p>
      <p>💨 Wind: {weatherData.weather.wind} m/s</p>
      <p>☁ {weatherData.weather.description}</p>
    </div>
  );
}

export default Weather;
