import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const { pathname } = useLocation();
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/" className="text-lg font-semibold">VidyaVichara</Link>
        <div className="flex items-center gap-3">
          <Link to="/" className={linkCls(pathname === "/")}>Board</Link>
          <Link to="/instructor" className={linkCls(pathname === "/instructor")}>Instructor</Link>
          <Link to="/history" className={linkCls(pathname === "/history")}>History</Link>
          {!token ? (
            <>
              <Link to="/login" className="rounded bg-gray-900 px-3 py-1 text-white">Login</Link>
              <Link to="/signup" className="rounded border px-3 py-1">Signup</Link>
            </>
          ) : (
            <button onClick={logout} className="rounded border px-3 py-1">
              Logout {user?.name ? `(${user.name})` : ""}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
function linkCls(active) {
  return `px-2 py-1 ${active ? "font-semibold underline" : "text-gray-600"}`;
}
