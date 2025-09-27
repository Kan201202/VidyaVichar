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
          {/* Show navigation only when logged in */}
          {token && (
            <>
              {/* Role-specific main navigation */}
              {user?.role === 'student' && (
                <Link to="/student-landing" className={linkCls(pathname === '/student-landing')}>
                  My Courses
                </Link>
              )}
              {user?.role === 'instructor' && (
                <Link to="/instructor-landing" className={linkCls(pathname === '/instructor-landing')}>
                  My Courses
                </Link>
              )}
              
              {/* Course management links */}
              {user?.role === 'instructor' && (
                <Link to="/create-course" className={linkCls(pathname === '/create-course')}>
                  Create Course
                </Link>
              )}
              {user?.role === 'student' && (
                <Link to="/browse-courses" className={linkCls(pathname === '/browse-courses')}>
                  Browse Courses
                </Link>
              )}
              
              <Link to="/history" className={linkCls(pathname === '/history')}>History</Link>
            </>
          )}
          
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