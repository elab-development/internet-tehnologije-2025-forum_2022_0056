import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export default function PrivateRoute({ children }) {
  const { user } = useContext(UserContext);

  // Ako user postoji → prikazi decu (komponentu koju ruta renderuje)
  // Ako user ne postoji → preusmeri na /login
  return user ? children : <Navigate to="/login" />;
}
