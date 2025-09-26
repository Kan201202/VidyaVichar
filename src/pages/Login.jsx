import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    
    if (email && password) {
      setTimeout(() => {
        setBusy(false);
        navigate("/dashboard"); 
      }, 500);
    } else {
      setBusy(false);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold">Login</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="email@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <input
            className="w-full rounded border px-3 py-2 pr-10"
            type={showPw ? "text" : "password"}
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
          >
            {showPw ? "🙈" : "👁️"}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Signing in…" : "Login"}
        </button>
      </form>
      <p className="mt-3 text-sm text-gray-600">
        No account? <Link to="/signup" className="underline">Sign up</Link>
      </p>
    </div>
  );
}
