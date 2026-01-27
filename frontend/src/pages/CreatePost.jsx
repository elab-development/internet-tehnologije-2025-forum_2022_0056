// pages/CreatePost.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Input from '../components/Input';
import Button from '../components/Button';

function CreatePost() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    theme_id: '',
  });
  
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Proveri da li je korisnik ulogovan
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Učitaj teme
  useEffect(() => {
    async function fetchThemes() {
      try {
        const res = await fetch('http://localhost:8000/api/themes');
        if (res.ok) {
          const data = await res.json();
          setThemes(data.themes || []);
        }
      } catch (err) {
        console.error('Greška pri učitavanju tema:', err);
      }
    }
    
    fetchThemes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validacija
    if (!formData.title.trim()) {
      setError('Naslov je obavezan!');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Sadržaj je obavezan!');
      return;
    }
    
    if (!formData.theme_id) {
      setError('Izaberite temu!');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          theme_id: parseInt(formData.theme_id),
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri kreiranju objave');
      }

      // Success!
      setSuccess(true);
      console.log('Objava kreirana:', data);
      
      // Redirect na novu objavu nakon 2 sekunde
      setTimeout(() => {
        navigate(`/post/${data.post.id}`);
      }, 2000);

    } catch (err) {
      console.error('Greška:', err);
      setError(err.message || 'Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Pristup zabranjen</h2>
        <p>Morate biti prijavljeni da biste kreirali objavu.</p>
        <Button onClick={() => navigate('/login')}>Prijavite se</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <Button onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>
          ← Nazad
        </Button>
        <h1 style={{ margin: '20px 0', color: '#0d47a1' }}>✏️ Kreiraj novu objavu</h1>
        <p style={{ color: '#666' }}>
          Podelite svoje iskustvo, postavite pitanje ili započnite diskusiju.
        </p>
      </div>

      {success ? (
        <div style={{
          background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center',
          border: '2px solid #4caf50'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ color: '#2e7d32' }}>Uspešno ste kreirali objavu!</h2>
          <p style={{ color: '#555', marginBottom: '20px' }}>
            Preusmeravam vas na novu objavu...
          </p>
          <div style={{
            width: '100%',
            height: '6px',
            background: '#e0e0e0',
            borderRadius: '3px',
            overflow: 'hidden',
            marginTop: '20px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #4caf50, #81c784)',
              animation: 'progressBar 2s linear forwards'
            }} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          {/* Error message */}
          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #f44336'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Naslov */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#37474f',
                fontSize: '0.95rem'
            }}>
                Naslov objave
            </label>
            <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Unesite naslov objave..."
                required
                disabled={loading}
                style={{
                width: '100%',
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #b0bec5',
                fontSize: '1rem',
                transition: 'border 0.2s ease',
                }}
                onFocus={(e) => e.target.style.border = '1px solid #42a5f5'}
                onBlur={(e) => e.target.style.border = '1px solid #b0bec5'}
            />
            </div>

          {/* Izbor teme */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#37474f',
              fontSize: '0.95rem'
            }}>
              🏷️ Izaberite temu
            </label>
            <select
              name="theme_id"
              value={formData.theme_id}
              onChange={handleChange}
              disabled={loading || themes.length === 0}
              required
              style={{
                width: '100%',
                padding: '12px 15px',
                borderRadius: '8px',
                border: '1px solid #b0bec5',
                fontSize: '1rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'border 0.2s ease',
              }}
              onFocus={(e) => e.target.style.border = '1px solid #42a5f5'}
              onBlur={(e) => e.target.style.border = '1px solid #b0bec5'}
            >
              <option value="">-- Izaberite temu --</option>
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} {theme.description ? `(${theme.description})` : ''}
                </option>
              ))}
            </select>
            {themes.length === 0 && (
              <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '5px' }}>
                Učitavam teme...
              </p>
            )}
          </div>

          {/* Sadržaj */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#37474f',
              fontSize: '0.95rem'
            }}>
              📝 Sadržaj
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Napišite sadržaj vaše objave..."
              rows="10"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #b0bec5',
                fontSize: '1rem',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                resize: 'vertical',
                minHeight: '200px',
                transition: 'border 0.2s ease',
              }}
              onFocus={(e) => e.target.style.border = '1px solid #42a5f5'}
              onBlur={(e) => e.target.style.border = '1px solid #b0bec5'}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '5px',
              fontSize: '0.85rem',
              color: '#78909c'
            }}>
              <span>Minimalno 10 karaktera</span>
              <span>{formData.content.length} karaktera</span>
            </div>
          </div>

          {/* Dugmad */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <Button
              type="submit"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? (
                <>
                  <span style={{ marginRight: '8px' }}>⏳</span>
                  Kreiranje u toku...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>📤</span>
                  Objavi
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
              disabled={loading}
            >
              Otkaži
            </Button>
          </div>

          {/* Info box */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            background: '#f5f5f5',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>💡</span>
              <div>
                <p style={{ margin: '0 0 5px 0' }}>
                  <strong>Saveti za dobru objavu:</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Budite jasni i konkretni</li>
                  <li>Koristite odgovarajuću temu</li>
                  <li>Poštujte druge članove foruma</li>
                  <li>Proverite pravila foruma pre objavljivanja</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreatePost;