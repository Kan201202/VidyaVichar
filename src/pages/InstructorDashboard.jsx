import { useEffect, useMemo, useState } from "react";
import Toolbar from "../components/Toolbar.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import * as qApi from "../api/questions.js";
import { listClasses, startClass, endClass, getActiveClass } from "../api/classes.js";

export default function InstructorDashboard() {
  const [activeClass, setActiveClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");

  const refresh = async () => {
    const cls = await getActiveClass();
    setActiveClass(cls);
    setClasses(await listClasses());
    if (cls) setItems(await qApi.list({ classId: cls.id }));
    else setItems([]);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== "all") {
      list = list.filter(i =>
        filter === "unanswered"
          ? (i.status ?? "unanswered") === "unanswered"
          : i.status === filter
      );
    }
    if (query) list = list.filter(i => i.text.toLowerCase().includes(query.toLowerCase()));
    if (sort === "newest") list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest") list = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "pinned") list = [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return list;
  }, [items, filter, sort, query]);

  const toggleStatus = async (q, status) => {
    const next = q.status === status ? "unanswered" : status;
    const prev = items;
    setItems(prev => prev.map(i => (i._id === q._id ? { ...i, status: next } : i)));
    try {
      await qApi.update(q._id, { status: next });
    } catch (e) {
      setItems(prev);
      alert("Failed: " + e.message);
    }
  };

  const togglePin = async q => {
    const next = !q.pinned;
    const prev = items;
    setItems(prev => prev.map(i => (i._id === q._id ? { ...i, pinned: next } : i)));
    try {
      await qApi.update(q._id, { pinned: next });
    } catch (e) {
      setItems(prev);
      alert("Failed: " + e.message);
    }
  };

  const del = async q => {
    const prev = items;
    setItems(prev => prev.filter(i => i._id !== q._id));
    try {
      await qApi.remove(q._id);
    } catch (e) {
      setItems(prev);
      alert("Failed: " + e.message);
    }
  };

  const clearAnswered = async () => {
    if (!activeClass) return;
    if (!confirm("Clear all answered questions in this class?")) return;
    await qApi.clear("answered", null, activeClass.id); // pass null if your function expects a token param
    await refresh();
  };

  const clearAll = async () => {
    if (!activeClass) return;
    if (!confirm("Clear ALL questions in this class?")) return;
    await qApi.clear("all", null, activeClass.id); // pass null if your function expects a token param
    await refresh();
  };

  const handleStart = async () => {
    const name = prompt("Class name?", `Lecture ${new Date().toLocaleString()}`);
    if (!name) return;
    const cls = await startClass({ name });
    setActiveClass(cls);
    setItems([]);
    setClasses(await listClasses());
  };

  const handleEnd = async () => {
    if (!activeClass) return;
    await endClass(activeClass.id);
    setActiveClass(null);
    setItems([]);
    setClasses(await listClasses());
  };

  return (
    <div className="space-y-4">
      {/* Class controls */}
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
          <button onClick={handleStart} className="rounded bg-green-600 px-4 py-2 text-white">
            Start New Class
          </button>
        ) : (
          <button onClick={handleEnd} className="rounded bg-red-600 px-4 py-2 text-white">
            End Class
          </button>
        )}
      </div>

      {/* Board for active class */}
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
      ) : !activeClass ? (
        <div className="text-gray-600">Start a class to see questions here.</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600">No questions yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map(q => (
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

      {/* Past classes list */}
      <div className="rounded-lg border bg-white p-3">
        <div className="mb-2 font-medium">Past Classes</div>
        {classes.filter(c => c.status === "ended").length === 0 ? (
          <div className="text-gray-600">No past classes yet.</div>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            {classes
              .filter(c => c.status === "ended")
              .map(c => (
                <li key={c.id}>
                  {c.name} · ended {new Date(c.endedAt).toLocaleString()}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
