import { Code2, Sparkles } from 'lucide-react'

export default function DeveloperCard({ name, role, bio, avatarText }) {
  const finalName = name || "Devidas Kulkarni";
  const finalRole = role || "Lead Engineer & Architect";
  const finalAvatar = avatarText || "DK";
  const finalBio = bio || "Academic Final Year Project Showcase";

  return (
    <article className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/20 p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-400/10 blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-300 to-indigo-500 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20">
          {finalAvatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">{finalRole}</p>
          <p className="mt-1 font-display text-lg font-extrabold text-white tracking-tight">
            {finalName}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{finalBio}</p>
        </div>
        <Sparkles size={20} className="text-cyan-300 shrink-0" />
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-white/[.07] pt-3 text-[11px] text-slate-500 relative z-10">
        <span className="flex items-center gap-1.5"><Code2 size={13} className="text-cyan-400" /> Version 1.0.0</span>
        <span className="text-cyan-400/80 font-medium">© 2026 All Rights Reserved</span>
      </div>
    </article>
  )
}
