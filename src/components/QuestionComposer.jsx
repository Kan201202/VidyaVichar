import { useState, useMemo } from "react";

export default function QuestionComposer({ onSubmit, existingTexts = [] }) {
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

  const disabled = !normalized || normalized.length > limit || isDuplicate;

  const submit = (e) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit({ text: text.trim(), author: author.trim() || "Anonymous" });
    setText("");
  };

  return (
    <form onSubmit={submit} className="rounded-lg border bg-white p-4 shadow-sm">
      <label className="mb-2 block text-sm font-medium">Ask your question</label>
      <textarea
        className="h-24 w-full resize-none rounded border p-2"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type your question…"
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        <input
          className="w-56 rounded border p-2"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Your name (optional)"
        />
        <div className="flex items-center gap-3">
          <span className={text.length>limit ? "text-red-600" : ""}>
            {text.length}/{limit}
          </span>
          {isDuplicate && <span className="text-red-600">Duplicate question</span>}
          <button
            disabled={disabled}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}
