import { useState, useMemo } from "react";

export default function QuestionComposer({ onSubmit, existingTexts = [], disabled = false }) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const limit = 300;

  const normalized = useMemo(
    () => text.trim().toLowerCase().replace(/\s+/g, " "),
    [text]
  );
  const isDuplicate = useMemo(() => {
    const set = new Set(existingTexts.map(t => t.trim().toLowerCase().replace(/\s+/g, " ")));
    return normalized.length > 0 && set.has(normalized);
  }, [existingTexts, normalized]);

  const remaining = limit - text.length;
  const over = remaining < 0;

  const submit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (over || isDuplicate || !text.trim()) return;
    onSubmit({ text: text.trim(), author: author.trim() || undefined });
    setText("");
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur p-4 shadow-sm">
      <label className="mb-2 block text-sm font-medium">Ask your question</label>

      <textarea
        disabled={disabled}
        className="rounded-xl border border-slate-200 w-full p-3 shadow-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed h-24 resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your question…"
      ></textarea>

      <div className="mt-2 flex items-center justify-between text-sm">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 shadow-sm"
          placeholder="Your name (optional)"
          disabled={disabled}
        />

        <div className="flex items-center gap-3">
          {isDuplicate && <div className="vv-hint text-red-600">This looks like a duplicate.</div>}
          <div className={`vv-hint ${over ? 'text-red-600' : 'text-slate-500'}`}>{remaining}</div>
          <button disabled={disabled || over || isDuplicate || !text.trim()} className="vv-btn">
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}