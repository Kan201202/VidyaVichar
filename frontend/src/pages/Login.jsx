import { useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await login(email, password);
      const to = loc.state?.from?.pathname || "/"; // Changed from "/instructor" to "/"
      nav(to, { replace: true });
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-xl shadow-lg bg-white p-8 border border-gray-200">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-900">Login</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 p-3 text-white font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          No account? <Link className="text-blue-600 hover:underline font-medium" to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}