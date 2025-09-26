import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    // Dummy success flow
    if (email && password) {
      setTimeout(() => {
        setBusy(false);
        if (role === "faculty") navigate("/dashboard");
        else navigate("/board");
      }, 500);
    } else {
      setBusy(false);
      setError("Signup failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-semibold">Sign Up</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
            />
            <span>Student</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="faculty"
              checked={role === "faculty"}
              onChange={() => setRole("faculty")}
            />
            <span>Faculty</span>
          </label>
        </div>
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="email@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Creating…" : "Create Account"}
        </button>
      </form>
      <p className="mt-3 text-sm text-gray-600">
        Already have an account? <Link to="/login" className="underline">Login</Link>
      </p>
    </div>
  );
}
