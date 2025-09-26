import { useEffect, useMemo, useState } from "react";
import QuestionComposer from "../components/QuestionComposer.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import Toolbar from "../components/Toolbar.jsx";
import * as qApi from "../api/questions.js";

/**
 * Public board where students post questions.
 * Validates empty/duplicate per brief. :contentReference[oaicite:1]{index=1}
 */
export default function StudentBoard() {
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("newest");
  const [query,setQuery]=useState("");

  useEffect(() => {
    let ignore=false;
    (async () => {
      try { setLoading(true); const data = await qApi.list(); if(!ignore) setItems(data ?? []); }
      finally { if(!ignore) setLoading(false); }
    })();
    return ()=>{ignore=true};
  }, []);

  const existingTexts = useMemo(() => items.map(i=>i.text), [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== "all") list = list.filter(i => (filter === "unanswered" ? (i.status ?? "unanswered")==="unanswered" : i.status === filter));
    if (query) list = list.filter(i => i.text.toLowerCase().includes(query.toLowerCase()));
    if (sort === "newest") list = [...list].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if (sort === "oldest") list = [...list].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    if (sort === "pinned") list = [...list].sort((a,b)=> (b.pinned?1:0)-(a.pinned?1:0));
    return list;
  }, [items, filter, sort, query]);

  const handleSubmit = async ({ text, author }) => {
    const optimistic = { _id: `tmp-${Date.now()}`, text, author, status: "unanswered", createdAt: new Date().toISOString() };
    setItems(prev => [optimistic, ...prev]);
    try {
      const saved = await qApi.create({ text, author });
      setItems(prev => [saved, ...prev.filter(x=>x._id!==optimistic._id)]);
    } catch (e) {
      setItems(prev => prev.filter(x=>x._id!==optimistic._id));
      alert("Failed to post question: " + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <QuestionComposer onSubmit={handleSubmit} existingTexts={existingTexts} />
      <Toolbar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} query={query} setQuery={setQuery} />
      {loading ? <div>Loading…</div> : filtered.length===0 ? <div className="text-gray-600">No questions yet.</div> : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map(q => <QuestionCard key={q._id} q={q} />)}
        </div>
      )}
    </div>
  );
}
