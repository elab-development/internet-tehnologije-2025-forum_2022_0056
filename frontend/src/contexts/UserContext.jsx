import { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  const logout = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).finally(() => {
      localStorage.removeItem("token");
      setUser(null);
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}