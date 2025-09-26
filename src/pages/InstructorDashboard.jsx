import { useMemo, useState } from "react";

export default function InstructorDashboard() {
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([
    { id: 1, text: "What is React?", status: "unanswered" },
    { id: 2, text: "Explain deadlock", status: "answered" },
  ]);

  const activeClass = useMemo(
    () => classes.find((c) => c.status === "active") || null,
    [classes]
  );

  const startNewClass = () => {
    if (activeClass) return;
    const newClass = { id: Date.now(), name: `Class ${classes.length + 1}`, status: "active" };
    setClasses([...classes, newClass]);
    setQuestions([]);
  };

  const endActiveClass = () => {
    if (!activeClass) return;
    setClasses(classes.map(c => c.id === activeClass.id ? { ...c, status: "ended" } : c));
  };

  const clearAll = () => {
    setQuestions([]);
  };

  const clearAnswered = () => {
    setQuestions(questions.filter(q => q.status !== "answered"));
  };

  const toggleStatus = (id) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, status: q.status === "answered" ? "unanswered" : "answered" } : q
    ));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3">
        <div className="flex-1">
          <div className="font-medium">Current Class:</div>
          {activeClass ? (
            <div>
              {activeClass.name} <span className="text-green-700">(active)</span>
            </div>
          ) : (
            <div className="text-gray-600">No active class</div>
          )}
        </div>

        {!activeClass ? (
          <button
            onClick={startNewClass}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Start New Class
          </button>
        ) : (
          <button
            onClick={endActiveClass}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            End Class
          </button>
        )}
      </div>

      <div className="rounded-lg border bg-white p-3">
        <div className="mb-2 font-medium">Questions</div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={clearAnswered}
            className="rounded bg-yellow-600 px-3 py-1 text-white"
          >
            Clear Answered
          </button>
          <button
            onClick={clearAll}
            className="rounded bg-red-600 px-3 py-1 text-white"
          >
            Clear All
          </button>
        </div>
        {questions.length === 0 ? (
          <div className="text-gray-600">No questions available</div>
        ) : (
          <ul className="space-y-2">
            {questions.map((q) => (
              <li
                key={q.id}
                className="flex items-center justify-between border rounded p-2"
              >
                <span>
                  {q.text}{" "}
                  <span className="text-sm text-gray-600">({q.status})</span>
                </span>
                <button
                  onClick={() => toggleStatus(q.id)}
                  className="rounded bg-blue-600 px-2 py-1 text-white"
                >
                  Toggle
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border bg-white p-3">
        <div className="mb-2 font-medium">Past Classes</div>
        {classes.filter(c => c.status === "ended").length === 0 ? (
          <div className="text-gray-600">No past classes yet.</div>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {classes.filter(c => c.status === "ended").map((c) => (
              <li key={c.id}>{c.name} · ended</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
