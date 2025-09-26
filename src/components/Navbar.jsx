import { Link, useLocation } from "react-router-dom";
import { supabase } from "../api/supabase.js";
import { useAuth } from "../context/AuthProvider.jsx";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, role } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/" className="text-lg font-semibold">VidyaVichara</Link>
        <div className="flex items-center gap-3">
          <Nav to="/" active={pathname === "/"}>Home</Nav>
          <Nav to="/board" active={pathname === "/board"}>Board</Nav>
          <Nav to="/dashboard" active={pathname === "/dashboard"}>Dashboard</Nav>
          <Nav to="/history" active={pathname === "/history"}>History</Nav>

          {!user ? (
            <>
              <Nav to="/login" active={pathname === "/login"}>Login</Nav>
              <Nav to="/signup" active={pathname === "/signup"}>Signup</Nav>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-600">({role})</span>
              <button onClick={logout} className="rounded bg-red-600 px-3 py-1 text-white">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function Nav({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-2 py-1 rounded ${active ? "font-semibold underline" : "text-gray-600 hover:underline"}`}
    >
      {children}
    </Link>
  );
}
