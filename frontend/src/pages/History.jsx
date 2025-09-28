import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import * as qApi from "../api/questions.js";

export default function History() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await qApi.history(token);
        setItems(data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const s = query.toLowerCase();
    return items.filter(i => i.text?.toLowerCase().includes(s));
  }, [items, query]);

  return (
    <div className="space-y-4">
      <div className="vv-panel p-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Question History</h1>
          <p className="text-sm text-slate-500">{items.length} total</p>
        </div>
        <input className="vv-input w-64" placeholder="Search my questions…" value={query} onChange={e=>setQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="vv-panel p-6 animate-pulse text-slate-500">Loading your history…</div>
      ) : filtered.length === 0 ? (
        <div className="vv-panel p-6 text-slate-500">No matching questions.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(q => (
            <div key={q._id} className="vv-card transition will-change-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-start justify-between">
                <span className="vv-badge capitalize">{q.status ?? "unanswered"}</span>
                {q.pinned ? <span className="vv-chip">📌 Pinned</span> : null}
              </div>
              <p className="vv-title mt-2">{q.text}</p>
              <div className="vv-meta mt-3">
                <span>{new Date(q.createdAt).toLocaleString()}</span>
                <span className="vv-chip">Course: {String(q.courseId).slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}