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
      <div className="flex items-center gap-2">
        <select className="rounded border p-2" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="pinned">Pinned first</option>
        </select>
        <input className="w-56 rounded border p-2" placeholder="Search…" value={query} onChange={e=>setQuery(e.target.value)} />
        {showDanger && (
          <>
            <button className="rounded border px-3 py-1" onClick={onClearAnswered}>Clear Answered</button>
            <button className="rounded border px-3 py-1 text-red-600" onClick={onClearAll}>Clear All</button>
          </>
        )}
      </div>
    </div>
  );
}
