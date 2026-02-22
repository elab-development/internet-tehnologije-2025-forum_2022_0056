import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper funkcija za čitanje cookie-ja (ista kao u Login)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    let cookieValue = parts.pop().split(';').shift();
    return decodeURIComponent(cookieValue);
  }
  return null;
}

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Uzmi CSRF cookie (isto kao u Login)
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

      // 4. Pošalji registraciju sa tokenom u headeru
      console.log("3. Sending register request...");
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-XSRF-TOKEN": xsrfToken,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password 
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      console.log("4. Registration successful!", data);
      setSuccess("Successfully registered! You can now login.");
      
      // Očisti formu
      setName("");
      setEmail("");
      setPassword("");
      
      // Preusmeri na login posle 2 sekunde
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.message);
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
      <h2 style={{ textAlign: "center", color: "#0d47a1" }}>Register</h2>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          style={inputStyle}
        />
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
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>Već imate nalog? <span onClick={() => navigate("/login")} style={{ color: "#42a5f5", cursor: "pointer", textDecoration: "underline" }}>Prijavite se</span></p>
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

export default Register;