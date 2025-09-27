// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useAuth } from "../context/AuthProvider.jsx"; // ← Make sure this import exists
// import QuestionComposer from "../components/QuestionComposer.jsx";
// import QuestionCard from "../components/QuestionCard.jsx";
// import Toolbar from "../components/Toolbar.jsx";
// import * as qApi from "../api/questions.js";

// export default function StudentBoard() {
//   const { courseId } = useParams();
//   const { token } = useAuth(); // ← Get the token from auth context
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [sort, setSort] = useState("newest");
//   const [query, setQuery] = useState("");

//   // Load questions for this course - PASS THE TOKEN
//   useEffect(() => {
//     let ignore = false;
//     (async () => {
//       try {
//         setLoading(true);
//         const data = await qApi.list({ courseId }, token); // ← Pass token here
//         if (!ignore) setItems(data ?? []);
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     })();
//     return () => {
//       ignore = true;
//     };
//   }, [courseId, token]); // ← Add token to dependencies

//   const existingTexts = useMemo(() => items.map((i) => i.text), [items]);

//   // Filter, sort, search logic (keep this same)
//   const filtered = useMemo(() => {
//     let list = items;
//     if (filter !== "all") {
//       list = list.filter((i) =>
//         filter === "unanswered"
//           ? (i.status ?? "unanswered") === "unanswered"
//           : i.status === filter
//       );
//     }
//     if (query) {
//       list = list.filter((i) =>
//         i.text.toLowerCase().includes(query.toLowerCase())
//       );
//     }
//     if (sort === "newest")
//       list = [...list].sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       );
//     if (sort === "oldest")
//       list = [...list].sort(
//         (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//       );
//     if (sort === "pinned")
//       list = [...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
//     return list;
//   }, [items, filter, sort, query]);

//   const handleSubmit = async ({ text, author }) => {
//     const optimistic = {
//       _id: `tmp-${Date.now()}`,
//       text,
//       author,
//       courseId,
//       status: "unanswered",
//       createdAt: new Date().toISOString(),
//     };

//     setItems((prev) => [optimistic, ...prev]);

//     try {
//       // PASS THE TOKEN when creating question
//       const saved = await qApi.create({ text, author, courseId }, token);
//       setItems((prev) => [
//         saved,
//         ...prev.filter((x) => x._id !== optimistic._id),
//       ]);
//     } catch (e) {
//       setItems((prev) => prev.filter((x) => x._id !== optimistic._id));
//       alert("Failed to post question: " + e.message);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <h1 className="text-2xl font-bold mb-4">
//         Question Board - {courseId.toUpperCase()}
//       </h1>
//       <QuestionComposer onSubmit={handleSubmit} existingTexts={existingTexts} />
//       <Toolbar
//         filter={filter}
//         setFilter={setFilter}
//         sort={sort}
//         setSort={setSort}
//         query={query}
//         setQuery={setQuery}
//       />
//       {loading ? (
//         <div>Loading…</div>
//       ) : filtered.length === 0 ? (
//         <div className="text-gray-600">No questions yet for this course.</div>
//       ) : (
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
//           {filtered.map((q) => (
//             <QuestionCard key={q._id} q={q} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";
import QuestionComposer from "../components/QuestionComposer.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import Toolbar from "../components/Toolbar.jsx";
import * as qApi from "../api/questions.js";
import useSocket from "../hooks/useSocket.js";

export default function StudentBoard() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");

  const { connected, joinCourse, on } = useSocket(token);

  // load initial
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await qApi.list({ courseId }, token);
        if (!ignore) setItems(data ?? []);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [courseId, token]);

  // join + subscribe
  useEffect(() => {
    if (!courseId) return;
    joinCourse(courseId);

    const upsert = (q) => {
      setItems((prev) => {
        const tmpIdx = prev.findIndex(x => String(x._id).startsWith("tmp-") && x.text === q.text);
        if (tmpIdx !== -1) { const next = [...prev]; next[tmpIdx] = q; return next; }
        const i = prev.findIndex(x => x._id === q._id);
        if (i === -1) return [q, ...prev];
        const next = [...prev]; next[i] = q; return next;
      });
    };
    const removeById = (id) => setItems((prev) => prev.filter((x) => x._id !== id));

    const off1 = on("question:created", (q) => { if (q.courseId === courseId) upsert(q); });
    const off2 = on("question:updated", (q) => { if (q.courseId === courseId) upsert(q); });
    const off3 = on("question:deleted", ({ id }) => removeById(id));
    const off4 = on("questions:cleared", ({ scope }) => {
      setItems((prev) => scope === "answered" ? prev.filter(q => q.status !== "answered") : []);
    });

    return () => { off1?.(); off2?.(); off3?.(); off4?.(); };
  }, [courseId, on, joinCourse]);

  const existingTexts = useMemo(() => items.map((i) => i.text), [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== "all") {
      list = list.filter((i) =>
        filter === "unanswered" ? (i.status ?? "unanswered") === "unanswered" : i.status === filter
      );
    }
    if (query) list = list.filter((i) => i.text.toLowerCase().includes(query.toLowerCase()));
    if (sort === "newest") list = [...list].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if (sort === "oldest") list = [...list].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    if (sort === "pinned") list = [...list].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
    return list;
  }, [items, filter, sort, query]);

  const handleSubmit = async ({ text, author }) => {
    const optimistic = {
      _id: `tmp-${Date.now()}`,
      text, author, courseId,
      status: "unanswered",
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [optimistic, ...prev]);
    try {
      const saved = await qApi.create({ text, author, courseId }, token);
      setItems((prev) => {
        const idx = prev.findIndex(x => x._id === optimistic._id);
        if (idx === -1) return prev; // already replaced by socket event
        const next = [...prev]; next[idx] = saved; return next;
      });
    } catch (e) {
      setItems((prev) => prev.filter((x) => x._id !== optimistic._id));
      alert("Failed to post question: " + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-1">Question Board - {courseId.toUpperCase()}</h1>
      <div className="text-xs opacity-60">{connected ? "Live connected" : "Live connecting..."}</div>

      <QuestionComposer onSubmit={handleSubmit} existingTexts={existingTexts} />
      <Toolbar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} query={query} setQuery={setQuery} />

      {loading ? <div>Loading…</div>
       : filtered.length === 0 ? <div className="text-gray-600">No questions yet.</div>
       : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
           {filtered.map((q) => <QuestionCard key={q._id} q={q} />)}
         </div>}
    </div>
  );
}
