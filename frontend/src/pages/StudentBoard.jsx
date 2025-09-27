import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import QuestionComposer from "../components/QuestionComposer.jsx";
import Toolbar from "../components/Toolbar.jsx";
import * as qApi from "../api/questions.js";
import { getActiveSession } from "../api/sessions.js";

export default function StudentBoard() {
  const { courseId } = useParams();
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");

  const [session, setSession] = useState(null); // Active session info
  const [sessionLoading, setSessionLoading] = useState(true);

  // =============================
  // Fetch active session for this course
  // =============================
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setSessionLoading(true);
        const activeSession = await getActiveSession(courseId, token);
        if (!ignore) setSession(activeSession);
      } catch (err) {
        console.error("Failed to fetch active session:", err);
        if (!ignore) setSession(null);
      } finally {
        if (!ignore) setSessionLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [courseId, token]);

  // =============================
  // Fetch questions for this course
  // =============================
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await qApi.list({ courseId }, token);
        if (!ignore) setItems(data ?? []);
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [courseId, token]);

  const existingTexts = useMemo(() => items.map((i) => i.text), [items]);

  // =============================
  // Filter, sort, and search
  // =============================
  const filtered = useMemo(() => {
    let list = items;
    if (filter !== "all") {
      list = list.filter((i) =>
        filter === "unanswered"
          ? (i.status ?? "unanswered") === "unanswered"
          : i.status === filter
      );
    }
    if (query) {
      list = list.filter((i) =>
        i.text.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (sort === "newest")
      list = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    if (sort === "oldest")
      list = [...list].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    if (sort === "pinned")
      list = [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return list;
  }, [items, filter, sort, query]);

  // =============================
  // Handle new question
  // =============================
  const handleSubmit = async ({ text, author }) => {
    if (!session) {
      alert("You can only ask questions during an active session!");
      return;
    }

    const optimistic = {
      _id: `tmp-${Date.now()}`,
      text,
      author,
      courseId,
      status: "unanswered",
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [optimistic, ...prev]);

    try {
      const saved = await qApi.create({ text, author, courseId }, token);
      setItems((prev) => [
        saved,
        ...prev.filter((x) => x._id !== optimistic._id),
      ]);
    } catch (e) {
      setItems((prev) => prev.filter((x) => x._id !== optimistic._id));
      alert("Failed to post question: " + e.message);
    }
  };

  // =============================
  // Render
  // =============================
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">
        Question Board - {courseId.toUpperCase()}
      </h1>

      {/* Session status */}
      {sessionLoading ? (
        <div className="p-4 text-gray-500">Checking session status...</div>
      ) : session ? (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          Active session in progress:{" "}
          <strong>{session.title || "Lecture in Progress"}</strong>
        </div>
      ) : (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          No active session right now. You can't ask questions until the
          instructor starts one.
        </div>
      )}

      {/* Only show composer if session is active */}
      {session && (
        <QuestionComposer
          onSubmit={handleSubmit}
          existingTexts={existingTexts}
        />
      )}

      {/* Toolbar */}
      <Toolbar
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        query={query}
        setQuery={setQuery}
      />

      {/* Questions grid */}
      {loading ? (
        <div className="text-gray-500">Loading questions...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600">No questions yet for this course.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <div
              key={q._id}
              className={`p-4 rounded-xl shadow-md transition transform hover:scale-[1.02] 
                ${q.pinned ? "bg-yellow-100 border-yellow-400" : "bg-blue-50"}`}
            >
              {/* Question text */}
              <p className="text-gray-800 font-medium mb-2">{q.text}</p>
              <p className="text-xs text-gray-500">
                Asked by: {q.studentId?.name || "Anonymous"}
              </p>

              {/* Instructor answer */}
              {q.answer && (
                <div className="mt-3 bg-green-100 p-2 rounded text-sm text-gray-700">
                  <strong>Instructor Answer:</strong> {q.answer}
                </div>
              )}

              {/* Status badge */}
              <div className="mt-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    q.status === "answered"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {q.status === "answered" ? "Answered" : "Unanswered"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
