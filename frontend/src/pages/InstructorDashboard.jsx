import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom"; //  for reading courseId
import { useAuth } from "../context/AuthProvider.jsx";
import Toolbar from "../components/Toolbar.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import * as qApi from "../api/questions.js";

export default function InstructorDashboard() {
  const { token } = useAuth();
  const { courseId } = useParams(); // read courseId from URL
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");

  // Load questions for this course
  const load = async () => {
    const data = await qApi.list({courseId}, token); //  pass courseId
    setItems(data ?? []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  // Filter, sort, search logic
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

  // Question moderation
  const toggleStatus = async (q, status) => {
    const next = q.status === status ? "unanswered" : status;
    const prev = items;
    setItems((prev) =>
      prev.map((i) => (i._id === q._id ? { ...i, status: next } : i))
    );
    try {
      await qApi.update(q._id, { status: next, courseId }, token);
    } catch (e) {
      setItems(prev);
      alert("Failed: " + e.message);
    }
  };

  const togglePin = async (q) => {
    const next = !q.pinned;
    const prev = items;
    setItems((prev) =>
      prev.map((i) => (i._id === q._id ? { ...i, pinned: next } : i))
    );
    try {
      await qApi.update(q._id, { pinned: next, courseId }, token);
    } catch (e) {
      setItems(prev);
      alert("Failed: " + e.message);
    }
  };

  const del = async (q) => {
    const prev = items;
    setItems((prev) => prev.filter((i) => i._id !== q._id));
    try {
      await qApi.remove(q._id, token);
    } catch (e) {
      setItems(prev);
      alert("Failed: " + e.message);
    }
  };

  const clearAnswered = async () => {
    if (!confirm("Clear all answered questions?")) return;
    await qApi.clear("answered", token, courseId);
    await load();
  };

  const clearAll = async () => {
    if (!confirm("Clear ALL questions? This cannot be undone.")) return;
    await qApi.clear("all", token, courseId);
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">
        Instructor Dashboard - {courseId.toUpperCase()}
      </h1>
      <Toolbar
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        query={query}
        setQuery={setQuery}
        onClearAnswered={clearAnswered}
        onClearAll={clearAll}
        showDanger
      />
      {loading ? (
        <div>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600">No questions for this course.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((q) => (
            <QuestionCard
              key={q._id}
              q={q}
              canModerate
              onToggleStatus={toggleStatus}
              onPin={togglePin}
              onDelete={del}
            />
          ))}
        </div>
      )}
    </div>
  );
}
