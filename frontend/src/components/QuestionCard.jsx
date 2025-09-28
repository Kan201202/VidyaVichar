import { useMemo } from "react";
import Card from "./Card.jsx";

export default function QuestionCard({ q, canModerate = false, onToggleStatus, onPin, onDelete }) {
  const badge = useMemo(() => {
    if (q.status === "answered") return "vv-badge bg-emerald-50 text-emerald-700 border-emerald-200";
    if (q.status === "important") return "vv-badge bg-amber-50 text-amber-700 border-amber-200";
    return "vv-badge";
  }, [q.status]);

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded px-2 py-0.5 text-xs ${badge}`}>
          {q.status ?? "unanswered"}
        </span>
        {q.pinned && <span className="vv-chip">📌 Pinned</span>}
      </div>

      <p className="whitespace-pre-wrap text-slate-900 leading-relaxed">{q.text}</p>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>
          {(q.author ?? "Anonymous")} · {new Date(q.createdAt).toLocaleTimeString()}
        </span>

        {canModerate && (
          <div className="vv-actions">
            <button className="vv-btn !bg-slate-900 hover:!bg-slate-800" onClick={() => onToggleStatus(q, "answered")}>Mark Answered</button>
            <button className="vv-btn !bg-slate-900 hover:!bg-slate-800" onClick={() => onToggleStatus(q, "important")}>Mark Important</button>
            <button className="vv-btn !bg-slate-900 hover:!bg-slate-800" onClick={() => onPin(q)}>{q.pinned ? "Unpin" : "Pin"}</button>
            <button className="vv-btn !bg-rose-600 hover:!bg-rose-700" onClick={() => onDelete(q)}>Delete</button>
          </div>
        )}
      </div>
    </Card>
  );
}