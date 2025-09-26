import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx"; // components → .. → context

export default function RoleGuard({ role: requiredRole, children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role !== requiredRole) return <Navigate to="/board" replace />;

  return children;
}
