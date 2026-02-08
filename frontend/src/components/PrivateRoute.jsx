import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useContext(UserContext);

   if (adminOnly) {
    // Samo admin može pristupiti
    return user && user.role === 'admin' ? children : <Navigate to="/" />;
  }

  // Ako user postoji - prikazi decu (komponentu koju ruta renderuje)
  // Ako user ne postoji - preusmeri na /login
  return user ? children : <Navigate to="/login" />;
}
