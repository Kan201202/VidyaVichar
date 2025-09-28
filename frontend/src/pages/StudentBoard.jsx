import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import QuestionComposer from "../components/QuestionComposer.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import Toolbar from "../components/Toolbar.jsx";
import * as qApi from "../api/questions.js";
import * as sessApi from "../api/sessions.js";
import useSocket from "../hooks/useSocket.js";

export default function StudentBoard() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  const { connected, on } = useSocket(token);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [qs, sess] = await Promise.all([
        qApi.list({ courseId }, token),
        sessApi.getActiveSession(courseId, token)
      ]);
      setItems(qs || []);
      setActiveSession(sess || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    on('question:created', (q) => { if (q.courseId === courseId) setItems(prev => (prev.some(x => x._id === q._id) ? prev : [q, ...prev])); });
    on('question:updated', (q) => setItems(prev => prev.map(x => x._id === q._id ? q : x)));
    on('question:deleted', (id) => setItems(prev => prev.filter(x => x._id !== id)));
    on('session:started', ({ courseId: c, sessionId }) => { if (c === courseId) setActiveSession({ _id: sessionId, courseId: c, isActive: true }); });
    on('session:ended', ({ courseId: c }) => { if (c === courseId) setActiveSession(null); });
  }, [on, courseId]);

  const existingTexts = useMemo(() => items.map(i => i.text), [items]);

  const handleSubmit = async ({ text, author }) => {
    try {
      await qApi.create({ text, author, courseId }, token);
      // rely on socket 'question:created' to update the list
    } catch (e) {
      console.error(e);
      alert('Failed to submit question');
    }
  };

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

  return (
    <><div className="relative -mx-4 mb-6"><div className="vv-hero"></div></div><div className="mx-auto max-w-5xl p-4">
      <h1 className="text-3xl font-extrabold tracking-tight mb-1">Question Board</h1>
      <div className="text-xs opacity-60">{connected ? "Live connected" : "Live connecting..."}</div>
      <div className="mt-2 mb-4">
        {activeSession ? <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Class is LIVE — you can submit questions</span>
                       : <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs">Class is OFF — questions disabled</span>}
      </div>

      <QuestionComposer onSubmit={handleSubmit} existingTexts={existingTexts} disabled={!activeSession} />

      <Toolbar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} query={query} setQuery={setQuery} />

      {loading ? <div>Loading…</div>
       : filtered.length === 0 ? <div className="text-gray-600">No questions yet.</div>
       : <div className="vv-grid">
           {filtered.map((q) => <QuestionCard key={q._id} q={q} />)}
         </div>}
    </div></>
  );
}