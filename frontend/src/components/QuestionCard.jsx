export default function QuestionCard({
  q,
  canModerate = false,
  onToggleStatus,
  onPin,
  onDelete,
}) {
  const badge = q.status === "answered" ? "bg-green-100 text-green-800"
              : q.status === "important" ? "bg-amber-100 text-amber-800"
              : "bg-gray-100 text-gray-800";

  return (
    <div className="rounded-lg border bg-yellow-50 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded px-2 py-0.5 text-xs ${badge}`}>
          {q.status ?? "unanswered"}
        </span>
        {q.pinned && <span className="text-xs">📌 Pinned</span>}
      </div>
      <p className="whitespace-pre-wrap">{q.text}</p>
      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <span>
          {q.author ?? "Anonymous"} · {new Date(q.createdAt).toLocaleTimeString()}
        </span>
        {canModerate && (
          <div className="flex gap-2">
            <button className="rounded border px-2 py-1" onClick={() => onToggleStatus(q, "answered")}>Mark Answered</button>
            <button className="rounded border px-2 py-1" onClick={() => onToggleStatus(q, "important")}>Mark Important</button>
            <button className="rounded border px-2 py-1" onClick={() => onPin(q)}>{q.pinned ? "Unpin" : "Pin"}</button>
            <button className="rounded border px-2 py-1 text-red-600" onClick={() => onDelete(q)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
