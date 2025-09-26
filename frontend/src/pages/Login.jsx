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
      const to = loc.state?.from?.pathname || "/instructor";
      nav(to, { replace: true });
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg border bg-white p-6">
      <h1 className="mb-4 text-xl font-semibold">Host Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50">
          {busy ? "Signing in…" : "Login"}
        </button>
      </form>
      <p className="mt-3 text-sm">No account? <Link className="underline" to="/signup">Sign up</Link></p>
    </div>
  );
}
