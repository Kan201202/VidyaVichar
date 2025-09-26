import { useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    try {
      setBusy(true);
      await signup(name, email, password);
      nav("/instructor", { replace: true });
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg border bg-white p-6">
      <h1 className="mb-4 text-xl font-semibold">Host Signup</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Confirm Password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50">
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
