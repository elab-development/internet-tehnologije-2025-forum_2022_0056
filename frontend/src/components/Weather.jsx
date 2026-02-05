import { useEffect, useState } from "react";

function Weather({ themeId }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getWeatherIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
    if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    if (desc.includes('wind')) return '💨';
    return '🌈';
  };

  const getTemperatureColor = (temp) => {
    if (temp < 0) return '#4fc3f7';
    if (temp < 10) return '#29b6f6';
    if (temp < 20) return '#66bb6a';
    if (temp < 30) return '#ffb74d';
    return '#ef5350';
  };

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/weather/theme/${themeId}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error('Nije moguće dohvatiti vremenske podatke');
        const data = await res.json();
        setWeather(data.weather);
      } catch (err) {
        console.error("Weather error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [themeId]);

  if (loading) return (
    <div style={{
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: '12px',
      width: '160px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '30px',
        height: '30px',
        margin: '0 auto 8px',
        borderRadius: '50%',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'loadingShimmer 1.5s infinite linear'
      }} />
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Učitavam...</p>
    </div>
  );

  if (error || !weather) return (
    <div style={{
      background: '#fff3e0',
      borderRadius: '12px',
      padding: '12px',
      width: '160px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      textAlign: 'center',
      border: '1px solid #ffcc80'
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🌫️</div>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#e65100' }}>
        Nema podataka
      </p>
    </div>
  );

  const tempColor = getTemperatureColor(weather.temperature);
  const weatherIcon = getWeatherIcon(weather.description);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${tempColor}15, ${tempColor}30)`,
      borderRadius: '14px',
      padding: '15px',
      width: '170px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${tempColor}30`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s ease'
    }}>
      {/* Sadržaj - kompaktan layout */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header - ikona i temperatura */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{ fontSize: '1.8rem' }}>
            {weatherIcon}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '1.6rem', 
              fontWeight: '700',
              color: tempColor,
              lineHeight: 1
            }}>
              {Math.round(weather.temperature)}°C
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#666',
              marginTop: '2px'
            }}>
              {weather.description}
            </div>
          </div>
        </div>

        {/* Detalji - compact row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          {/* Vetar */}
          <div style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '6px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#555', 
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px'
            }}>
              <span>💨</span>
              <span style={{ fontSize: '0.7rem' }}>Vetar</span>
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: '#1565c0' 
            }}>
              {weather.wind} m/s
            </div>
          </div>

          {/* Vlažnost */}
          <div style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '6px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#555', 
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px'
            }}>
              <span>💧</span>
              <span style={{ fontSize: '0.7rem' }}>Vlaž.</span>
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: '#0277bd' 
            }}>
              {weather.humidity}%
            </div>
          </div>
        </div>

        {/* Footer - timestamp */}
        <div style={{
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '0.65rem', 
            color: '#777',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px'
          }}>
            <span style={{ fontSize: '0.7rem' }}>🕒</span>
            <span>Ažurirano</span>
          </p>
        </div>
      </div>

      {/* Dekorativni element */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        zIndex: 0
      }} />
    </div>
  );
}

export default Weather;