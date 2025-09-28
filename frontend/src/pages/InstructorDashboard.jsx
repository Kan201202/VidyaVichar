
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import Toolbar from "../components/Toolbar.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import * as qApi from "../api/questions.js";
import * as sessApi from "../api/sessions.js";
import useSocket from "../hooks/useSocket.js";

export default function InstructorDashboard() {
  const { token, user } = useAuth();
  const { courseId } = useParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);

  const { connected, on } = useSocket(token);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await qApi.list({ courseId }, token);
      setItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  const loadActive = useCallback(async () => {
    try {
      const s = await sessApi.getActiveSession(courseId, token);
      setActiveSession(s);
    } catch {
      setActiveSession(null);
    }
  }, [courseId, token]);

  useEffect(() => { loadQuestions(); loadActive(); }, [loadQuestions, loadActive]);

  useEffect(() => {
    on('question:created', (q) => { if (q.courseId === courseId) setItems(prev => (prev.some(x => x._id === q._id) ? prev : [q, ...prev])); });
    on('question:updated', (q) => setItems(prev => prev.map(x => x._id === q._id ? q : x)));
    on('question:deleted', (id) => setItems(prev => prev.filter(x => x._id !== id)));
    on('session:started', ({ courseId: c, sessionId }) => { if (c === courseId) setActiveSession({ _id: sessionId, courseId: c, isActive: true }); });
    on('session:ended', ({ courseId: c }) => { if (c === courseId) setActiveSession(null); });
  }, [on, courseId]);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (filter === "unanswered") arr = arr.filter(i => i.status === "unanswered");
    if (filter === "answered") arr = arr.filter(i => i.status === "answered");
    if (filter === "important") arr = arr.filter(i => i.status === "important");
    if (query) arr = arr.filter(i => i.text.toLowerCase().includes(query.toLowerCase()));
    if (sort === "newest") arr.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
    if (sort === "oldest") arr.sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
    // pinned first, then keep date order
    arr.sort((a, b) => (b.pinned === true) - (a.pinned === true));
    return arr;
  }, [items, filter, sort, query]);

  const toggleStatus = async (q, status) => {
    const next = q.status === status ? "unanswered" : status;
    const updated = await qApi.update(q._id, { status: next }, token);
    setItems(prev => prev.map(x => x._id === updated._id ? updated : x));
  };

  const togglePin = async (q) => {
    const updated = await qApi.update(q._id, { pinned: !q.pinned }, token);
    setItems(prev => prev.map(x => x._id === updated._id ? updated : x));
  };

  const del = async (q) => {
    await qApi.remove(q._id, token);
    setItems(prev => prev.filter(x => x._id !== q._id));
  };

  const startClass = async () => {
    try {
      setStarting(true);
      const s = await sessApi.startSession({ courseId }, token);
      setActiveSession(s);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setStarting(false);
    }
  };

  const endClass = async () => {
    try {
      if (!activeSession) return;
      setEnding(true);
      await sessApi.endSession(activeSession._id, token);
      setActiveSession(null);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setEnding(false);
    }
  };

  return (
    <>
      {/* Blue hero header card */}
      <div className="mx-auto max-w-6xl p-4">
        <div className="mb-4 rounded-2xl border bg-blue-600 text-white p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Instructor Board
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-300 animate-pulse" : "bg-amber-300 animate-pulse"}`}
                    aria-hidden
                  />
                  {connected ? "Live connected" : "Live connecting..."}
                </span>

                {activeSession ? (
                  // 🔆 Light-green LIVE pill
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-200 text-green-800 px-3 py-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" className="fill-green-600">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Class is LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-80"><path d="M12 2v20" /></svg>
                    Class is OFF
                  </span>
                )}
              </div>
            </div>

            {user?.role === 'instructor' && (
              <div className="flex gap-2">
                {!activeSession ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition bg-white/20 text-white border border-white/30 hover:bg-white/30 disabled:opacity-60"
                    onClick={startClass}
                    disabled={starting}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                    {starting ? "Starting…" : "Start Class"}
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 shadow-sm transition bg-white/20 text-white border border-white/30 hover:bg-white/30 disabled:opacity-60"
                    onClick={endClass}
                    disabled={ending}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>
                    {ending ? "Ending…" : "End Class"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Toolbar sits inside the blue card, on white for contrast */}
          <div className="mt-4 rounded-xl bg-white text-slate-900 shadow-sm">
            <div className="p-4">
              <Toolbar
                filter={filter} setFilter={setFilter}
                sort={sort} setSort={setSort}
                query={query} setQuery={setQuery}
              />
            </div>
          </div>
        </div>

        {/* Content area */}
        {loading ? (
          // Skeletons
          <div className="grid vv-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white/60 p-4 animate-pulse">
                <div className="h-4 w-24 rounded bg-slate-200 mb-3" />
                <div className="h-5 w-3/4 rounded bg-slate-200 mb-2" />
                <div className="h-5 w-2/3 rounded bg-slate-200 mb-4" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 rounded bg-slate-200" />
                  <div className="h-8 w-16 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Empty state
          <div className="mx-auto max-w-xl rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg width="22" height="22" viewBox="0 0 24 24" className="opacity-70">
                <path d="M3 5h18v12H5l-2 2V5z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold">No questions yet</h2>
            <p className="mt-1 text-sm text-slate-500">
              When students post, they’ll appear here instantly.
            </p>
          </div>
        ) : (
          // Grid
          <div className="vv-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((q) => (
              <div key={q._id} className="group relative transition">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-br from-transparent via-transparent to-slate-200/40 pointer-events-none transition" />
                <QuestionCard
                  q={q}
                  canModerate
                  onToggleStatus={toggleStatus}
                  onPin={togglePin}
                  onDelete={del}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
