export default function Toolbar({
  filter, setFilter,
  sort, setSort,
  query, setQuery,
  onClearAnswered, onClearAll,
  showDanger = false
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3">
      <div className="flex gap-2">
        {["all","unanswered","answered","important"].map(f => (
          <button
            key={f}
            className={`rounded px-3 py-1 ${filter===f ? "bg-gray-900 text-white" : "border"}`}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <select className="vv-input" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="pinned">Pinned first</option>
        </select>
        <input className="w-56 vv-input" placeholder="Search…" value={query} onChange={e=>setQuery(e.target.value)} />
        {showDanger && (
          <>
            <button className="vv-btn" onClick={onClearAnswered}>Clear Answered</button>
            <button className="vv-btn text-red-600 border-red-200 hover:bg-red-50" onClick={onClearAll}>Clear All</button>
          </>
        )}
      </div>
    </div>
  );
}
