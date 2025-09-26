import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function AuthGuard({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-6">Loading…</div>;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
