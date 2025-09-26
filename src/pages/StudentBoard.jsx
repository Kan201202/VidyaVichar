import { useEffect, useMemo, useState } from "react";
import QuestionComposer from "../components/QuestionComposer.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import Toolbar from "../components/Toolbar.jsx";
import * as qApi from "../api/questions.js";
import { getActiveClass } from "../api/classes.js";

export default function StudentBoard() {
  const [activeClass, setActiveClass] = useState(null);
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all"); const [sort,setSort]=useState("newest"); const [query,setQuery]=useState("");

  useEffect(()=>{ (async()=>{
    const cls = await getActiveClass();
    setActiveClass(cls);
    setLoading(true);
    const data = cls ? await qApi.list({ classId: cls.id }) : [];
    setItems(data ?? []); setLoading(false);
  })(); }, []);

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
    if (!activeClass) { alert("No active class right now. Please wait for the instructor to start a class."); return; }
    const optimistic = { _id: `tmp-${Date.now()}`, classId: activeClass.id, text, author, status: "unanswered", createdAt: new Date().toISOString() };
    setItems(prev => [optimistic, ...prev]);
    try {
      const saved = await qApi.create({ text, author, classId: activeClass.id });
      setItems(prev => [saved, ...prev.filter(x=>x._id!==optimistic._id)]);
    } catch (e) {
      setItems(prev => prev.filter(x=>x._id!==optimistic._id));
      alert("Failed to post: " + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-3">
        <strong>Current Class:</strong>{" "}
        {activeClass ? <span>{activeClass.name} (active)</span> : <span className="text-gray-600">No active class started yet</span>}
      </div>

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
