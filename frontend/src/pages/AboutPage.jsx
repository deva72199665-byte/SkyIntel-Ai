import React from 'react';
import { Cpu, ShieldCheck, Sparkles, Database, Layers, CloudRain, Brain, Users, Award, Code } from 'lucide-react';
import DeveloperCard from '../components/DeveloperCard';

export default function AboutPage() {
  return (
    <div className="space-y-10 pb-12">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-800 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
          <span>Next-Generation Weather Intelligence</span>
        </div>
        <h1 className="font-heading text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          About <span className="text-gradient">SkyIntel AI</span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed font-medium">
          SkyIntel AI is an enterprise-grade Weather Intelligence Platform built to predict precipitation impacts, flood risk vulnerabilities, and extreme climate events using ensemble machine learning and SHAP explainability.
        </p>
      </section>

      {/* Core Architectural Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 grid place-items-center">
            <Brain className="h-5 w-5" />
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900">Multi-Model ML Ensemble</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Combines Random Forest, XGBoost, and HistGradientBoosting via Soft-Voting classification to evaluate non-linear atmospheric telemetry with high ROC-AUC precision.
          </p>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 grid place-items-center">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900">SHAP Explainable AI</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates black-box ML predictions by computing SHapley Additive exPlanations, attributing exact percentage impact to temperature, humidity, and barometric pressure.
          </p>
        </div>

        <div className="glass-card p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 grid place-items-center">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900">Multi-Tier Geocoding</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Solves location resolution issues using OpenWeather Geocoding, OpenStreetMap Nominatim fallback, and an offline fuzzy matching engine over 500+ global cities.
          </p>
        </div>
      </section>

      {/* System Stack Showcase */}
      <section className="glass rounded-2xl p-8 border border-slate-200 bg-white space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sky-600 text-white grid place-items-center">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-900">Platform Technology Stack</h2>
            <p className="text-xs text-slate-500">Commercial SaaS Architecture &amp; Libraries</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-1">
            <span className="text-sky-600 uppercase tracking-wider text-[10px]">Backend Framework</span>
            <p className="text-slate-900 font-bold">FastAPI + Async Uvicorn</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-1">
            <span className="text-indigo-600 uppercase tracking-wider text-[10px]">Frontend UI Engine</span>
            <p className="text-slate-900 font-bold">React 18 + Vite + Tailwind</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-1">
            <span className="text-emerald-600 uppercase tracking-wider text-[10px]">ML &amp; Explainability</span>
            <p className="text-slate-900 font-bold">Scikit-Learn, XGBoost, SHAP</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-1">
            <span className="text-amber-600 uppercase tracking-wider text-[10px]">Database &amp; Security</span>
            <p className="text-slate-900 font-bold">SQLAlchemy 2.0 + JWT</p>
          </div>
        </div>
      </section>

      {/* Developer Credits Section */}
      <section className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl font-bold text-slate-900">Developer Credits</h2>
          <p className="text-xs text-slate-500 font-medium">Developed by DSMV Labs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <DeveloperCard
            name="Devidas Kulkarni"
            role="Full Stack Architect &amp; ML Engineer"
            bio="Specializing in FastAPI microservices, machine learning model optimization, SHAP explainability, and full-stack SaaS development."
            avatarText="DK"
          />
          <DeveloperCard
            name="Sudhanwa Kulkarni"
            role="UI/UX Designer &amp; Systems Architect"
            bio="Focusing on responsive user experience design, dark mode aesthetics, interactive weather visualizations, and robust frontend architecture."
            avatarText="SK"
          />
          <DeveloperCard
            name="Mohammed Musaddiq"
            role="Associate Software Engineer &amp; Frontend Specialist"
            bio="Focused on building accessible, performant frontend architectures, responsive user interfaces, and custom visual components."
            avatarText="MM"
          />
          <DeveloperCard
            name="Vedant Rajegore"
            role="Backend Engineer &amp; Database Specialist"
            bio="Specializing in backend system design, database schema optimization, pipeline scalability, and API route security."
            avatarText="VR"
          />
        </div>
      </section>
    </div>
  );
}

