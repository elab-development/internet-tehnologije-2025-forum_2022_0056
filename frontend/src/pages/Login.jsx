import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

// Helper funkcija za čitanje cookie-ja - DODAJ OVO NA VRH FAJLA
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    let cookieValue = parts.pop().split(';').shift();
    return decodeURIComponent(cookieValue);
  }
  return null;
}

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Uzmi CSRF cookie
      console.log("1. Fetching CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2. Sačekaj malo da se cookie sačuva
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3. Uzmi XSRF token iz cookie-ja
      const xsrfToken = getCookie('XSRF-TOKEN');
      console.log("2. XSRF Token:", xsrfToken ? "PRONAĐEN" : "NIJE PRONAĐEN");

      // 4. Pošalji login sa tokenom u headeru
      console.log("3. Sending login request...");
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": xsrfToken,  // <-- Token iz cookie-ja
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();
      console.log("4. Login successful!");
      
      localStorage.setItem("token", data.access_token);
      
      // 5. Dohvati korisničke podatke
      console.log("5. Fetching user data...");
      const userRes = await fetch("http://localhost:8000/api/user", {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${data.access_token}`,
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
      });

      if (!userRes.ok) {
        throw new Error("Cannot fetch user data");
      }

      const userData = await userRes.json();
      setUser(userData);
      
      // PREUSMERI NA POČETNU
      navigate("/");
      
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: "50px auto",
      padding: 20,
      background: "#f0f4f8",
      borderRadius: 10,
      boxShadow: "0 6px 12px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center", color: "#0d47a1" }}>Login</h2>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          style={inputStyle}
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{
            ...buttonStyle,
            backgroundColor: loading ? "#90caf9" : "#42a5f5",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>Nemate nalog? <span onClick={() => navigate("/register")} style={{ color: "#42a5f5", cursor: "pointer", textDecoration: "underline" }}>Registrujte se</span></p>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#42a5f5",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  width: "100%",
};

export default Login;