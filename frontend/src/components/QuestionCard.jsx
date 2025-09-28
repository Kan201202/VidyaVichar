// import { useMemo } from "react";
// import Card from "./Card.jsx";

// export default function QuestionCard({ q, canModerate = false, onToggleStatus, onPin, onDelete }) {
//   const badge = useMemo(() => {
//     if (q.status === "Answered") return "vv-badge bg-emerald-50 text-emerald-700 border-emerald-200";
//     if (q.status === "Important") return "vv-badge bg-amber-50 text-amber-700 border-amber-200";
//     return "vv-badge";
//   }, [q.status]);

//   return (
//     <Card className="p-4">
//       <div className="mb-2 flex items-center justify-between">
//         <span className={`rounded px-2 py-0.5 text-xs ${badge}`}>
//           {q.status ?? "unAnswered"}
//         </span>
//         {q.pinned && <span className="vv-chip">📌 Pinned</span>}
//       </div>

//       <p className="whitespace-pre-wrap text-slate-900 leading-relaxed">{q.text}</p>

//       <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
//         <span>
//           {(q.author ?? "Anonymous")} · {new Date(q.createdAt).toLocaleTimeString()}
//         </span>

//         {canModerate && (
//           <div className="vv-actions">
//             <button className="vv-btn !bg-slate-900 hover:!bg-slate-800" onClick={() => onToggleStatus(q, "Answered")}>Mark Answered</button>
//             <button className="vv-btn !bg-slate-900 hover:!bg-slate-800" onClick={() => onToggleStatus(q, "Important")}>Mark Important</button>
//             <button className="vv-btn !bg-slate-900 hover:!bg-slate-800" onClick={() => onPin(q)}>{q.pinned ? "Unpin" : "Pin"}</button>
//             <button className="vv-btn !bg-rose-600 hover:!bg-rose-700" onClick={() => onDelete(q)}>Delete</button>
//           </div>
//         )}
//       </div>
//     </Card>
//   );
// }

import { useMemo } from "react";
import Card from "./Card.jsx";

export default function QuestionCard({ q, canModerate = false, onToggleStatus, onPin, onDelete }) {
  const badge = useMemo(() => {
    if (q.status === "Answered")
      return "vv-badge bg-emerald-50 text-emerald-700 border-emerald-200";
    if (q.status === "Important")
      return "vv-badge bg-amber-50 text-amber-700 border-amber-200";
    return "vv-badge bg-sky-50 text-sky-700 border-sky-200";
  }, [q.status]);

  const noteBg = useMemo(() => {
    if (q.status === "Answered")
      return "from-emerald-100 to-emerald-200 border-emerald-200";
    if (q.status === "Important")
      return "from-amber-100 to-amber-200 border-amber-200";
    return "from-sky-100 to-sky-200 border-sky-200";
  }, [q.status]);

  const dotColor = useMemo(() => {
    if (q.status === "Answered") return "bg-emerald-500";
    if (q.status === "Important") return "bg-amber-500";
    return "bg-sky-500";
  }, [q.status]);

  return (
    <Card
      className={`
        relative rounded-2xl border ${noteBg}
        bg-gradient-to-br p-5 shadow-[0_10px_22px_-8px_rgba(0,0,0,0.35)]
        transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-8px_rgba(0,0,0,0.4)]
        before:content-[''] before:absolute before:left-1/2 before:-top-2
        before:h-3.5 before:w-24 before:-translate-x-1/2 before:rotate-[-2deg]
        before:rounded-sm before:bg-white/60 before:shadow-sm before:backdrop-blur-sm
        after:content-[''] after:absolute after:right-0 after:top-0 after:h-10 after:w-10
        after:bg-gradient-to-br after:from-white/60 after:to-transparent
        after:rounded-bl-xl after:rounded-tr-2xl
      `}
      style={{ transform: "rotate(0.4deg)" }}
    >
      {q.pinned && (
        <span className="absolute right-3 -top-2 text-xl select-none">📌</span>
      )}

      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge}`}
        >
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {q.status ?? "unAnswered"}
        </span>
        <span className="text-[11px] text-slate-700">
          {(q.author ?? "Anonymous")} ·{" "}
          {new Date(q.createdAt).toLocaleTimeString()}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-slate-900 text-[1.1rem] font-semibold italic leading-relaxed tracking-[0.01em]">
        {q.text}
      </p>

      {canModerate && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow hover:from-emerald-600 hover:to-emerald-700 transition"
            onClick={() => onToggleStatus(q, "Answered")}
          >
            {q.status === "Answered" ? "✔ Unmark Answered" : "✔ Mark Answered"}
          </button>

          <button
            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow hover:from-amber-500 hover:to-amber-600 transition"
            onClick={() => onToggleStatus(q, "Important")}
          >
            {q.status === "Important" ? "⭐ Unmark Important" : "⭐ Mark Important"}
          </button>

          <button
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg shadow transition ${
              q.pinned
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                : "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 hover:from-slate-300 hover:to-slate-400"
            }`}
            onClick={() => onPin(q)}
          >
            {q.pinned ? "📌 Unpin" : "📍 Pin"}
          </button>

          <button
            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow hover:from-rose-600 hover:to-rose-700 transition"
            onClick={() => onDelete(q)}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </Card>
  );
}
