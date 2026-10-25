import React from 'react';
import { Award, Code, Cpu, Database, Globe, Layers, ShieldCheck, Sparkles } from 'lucide-react';

export default function CreditsPage() {
  const techStack = [
    { name: 'FastAPI', category: 'Backend REST Framework', icon: Cpu },
    { name: 'React 18 & Vite', category: 'Frontend Engine', icon: Code },
    { name: 'scikit-learn & XGBoost', category: 'Machine Learning Ensemble', icon: Layers },
    { name: 'SHAP (SHapley Additive exPlanations)', category: 'Explainable AI', icon: Sparkles },
    { name: 'SQLAlchemy & SQLite', category: 'Database & ORM', icon: Database },
    { name: 'Leaflet & OpenStreetMap', category: 'Geospatial Mapping', icon: Globe },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="eyebrow">SYSTEM CREDITS &amp; METADATA</span>
        <h1 className="page-title">SkyIntel AI Platform Details</h1>
        <p className="page-subtitle">Official credits, technology stack, and licensing documentation.</p>
      </div>

      <div className="glass p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-slate-900">SkyIntel AI</h2>
            <p className="text-sm font-medium text-sky-600">AI-Powered Weather Intelligence Platform</p>
          </div>
          <span className="badge-dev py-1 px-3 text-xs">Version 2.0.0 (Commercial Grade)</span>
        </div>

        {/* Developer Attribution Card */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800">Developers &amp; Architects</span>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            DSMV Labs
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Crafted for final-year engineering evaluation, competitive portfolio presentation, placements, research benchmarks, and startup deployment.
          </p>
        </div>

        {/* System Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Version</span>
            <strong className="text-sm font-bold text-slate-900">v2.0.0</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Last Updated</span>
            <strong className="text-sm font-bold text-slate-900">July 2026</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">License</span>
            <strong className="text-sm font-bold text-slate-900">MIT Open Source</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
            <strong className="text-sm font-bold text-emerald-600">Production Ready</strong>
          </div>
        </div>

        {/* Technologies Grid */}
        <div>
          <h3 className="card-title mb-4">Core Technology Stack</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{tech.name}</h4>
                    <p className="text-[11px] text-slate-500">{tech.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
