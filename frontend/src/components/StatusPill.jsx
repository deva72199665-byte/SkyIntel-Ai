const styles = { High: 'bg-rose-400/15 text-rose-200 ring-rose-300/20', Medium: 'bg-amber-300/15 text-amber-100 ring-amber-300/20', Low: 'bg-emerald-300/15 text-emerald-100 ring-emerald-300/20', Good: 'bg-emerald-300/15 text-emerald-100 ring-emerald-300/20', Average: 'bg-amber-300/15 text-amber-100 ring-amber-300/20', Poor: 'bg-rose-400/15 text-rose-200 ring-rose-300/20' }

export default function StatusPill({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[value] || 'bg-white/10 text-white/80 ring-white/10'}`}>{value}</span>
}
