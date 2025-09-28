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
      nav("/", { replace: true }); // Changed from "/instructor" to "/"
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-xl shadow-lg bg-white p-8 border border-gray-200">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-900">Signup</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Name"
            value={name}
            onChange={e=>setName(e.target.value)}
          />
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
          <input
            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm Password"
            type="password"
            value={confirm}
            onChange={e=>setConfirm(e.target.value)}
          />
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 p-3 text-white font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}