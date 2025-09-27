import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function RoleGuard({ allowedRoles, children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allowedRoles.includes(role)) {
    // Redirect students to board, instructors to dashboard
    const redirectTo = role === 'student' ? '/board' : '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}