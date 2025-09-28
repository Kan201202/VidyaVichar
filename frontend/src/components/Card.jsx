export default function Card({ children, className = "" }) {
  return (
    <div className={`group rounded-2xl bg-white/90 backdrop-blur border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
}