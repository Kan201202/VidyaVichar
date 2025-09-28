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
      <div className="relative -mx-4 mb-6">
        <div className="vv-hero"></div>
      </div>

      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Instructor Board</h1>
            <div className="text-xs opacity-60">{connected ? "Live connected" : "Live connecting..."}</div>
            <div className="mt-1">
              {activeSession ? <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Class is LIVE</span>
                             : <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">Class is OFF</span>}
            </div>
          </div>

          {user?.role === 'instructor' && (
            <div className="flex gap-2">
              {!activeSession ? (
                <button className="vv-btn" onClick={startClass} disabled={starting}>
                  {starting ? "Starting…" : "Start Class"}
                </button>
              ) : (
                <button className="vv-btn" onClick={endClass} disabled={ending}>
                  {ending ? "Ending…" : "End Class"}
                </button>
              )}
            </div>
          )}
        </div>

        <Toolbar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} query={query} setQuery={setQuery} />

        {loading ? (
          <div>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600">No questions yet.</div>
        ) : (
          <div className="vv-grid">
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
    </>
  );
}