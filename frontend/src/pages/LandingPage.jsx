import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  CloudRain,
  ShieldAlert,
  Sparkles,
  Zap,
  Sliders,
  Flame,
  Globe
} from 'lucide-react';
import WeatherMap from '../components/WeatherMap';
import WeatherCanvas from '../components/WeatherCanvas';
import DeveloperCard from '../components/DeveloperCard';

export default function LandingPage({ user }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-12 animate-fade-in">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative rounded-3xl border border-white/10 bg-slate-900/30 p-8 sm:p-14 shadow-2xl overflow-hidden min-h-[480px] flex items-center">
        
        {/* Cool rain canvas backing */}
        <div className="absolute inset-0 z-0 opacity-40">
          <WeatherCanvas weatherType="rain" intensity={0.3} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Platform Badge */}
          <div className="badge-dev bg-white/5 border-white/10 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-sky-400 animate-spin" />
            <span>SKYINTEL AI V3 CORE</span>
          </div>

          <div>
            <h1 className="font-heading text-5xl sm:text-7xl font-black text-white tracking-tight leading-none">
              Atmospheric <span className="text-gradient">Intelligence</span>
            </h1>
            <p className="mt-3 text-lg sm:text-xl font-bold text-sky-400">
              Futuristic Weather Operating System
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
            Ensemble AI models, real-time hydrological flood risks scoring, explainable SHAP attributions, and dynamic decision-engine twins constructed for modern climate operations.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/prediction')}
              className="primary-button text-xs py-3.5 px-6"
            >
              <span>Launch Platform Inference</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/tools')}
              className="secondary-button text-xs py-3.5 px-5 bg-white/5 border-white/5 hover:bg-white/10"
            >
              <Sliders className="h-4 w-4 text-sky-400" />
              <span>Copilot twin simulator</span>
            </button>
          </div>
        </div>

        {/* Cinematic welcome emblem on right side */}
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 z-10">
          <div className="relative h-64 w-64 rounded-full border border-sky-500/10 flex items-center justify-center animate-spin" style={{ animationDuration: '30s' }}>
            <div className="absolute h-52 w-52 rounded-full border border-indigo-500/20 flex items-center justify-center animate-reverse-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute h-40 w-40 rounded-full border border-sky-400/30 flex items-center justify-center" />
            <CloudRain className="h-16 w-16 text-sky-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* 2. Platform Telemetry Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ML Ensemble precision', val: '98.4%' },
          { label: 'Latency index', val: '< 35ms' },
          { label: 'Active cities', val: '500+' },
          { label: 'Feature weight inputs', val: '6 metrics' },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 text-center space-y-1 hover:border-sky-500/20 transition duration-300">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{stat.label}</span>
            <b className="font-heading text-3xl font-extrabold block text-gradient">{stat.val}</b>
          </div>
        ))}
      </section>

      {/* 3. High-tech Features Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="eyebrow">Visual Ensembles</span>
          <h2 className="font-heading text-3xl font-black text-white">Commercial-Grade Architecture</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BrainCircuit,
              title: 'Soft-Voting Ensembles',
              desc: 'Merges XGBoost, Random Forest, and HistGradientBoosting to maximize prediction precision parameters.',
            },
            {
              icon: Sparkles,
              title: 'SHAP Explainable AI',
              desc: 'Calculates Game Theory values to trace exactly which telemetry metric drives risk levels.',
            },
            {
              icon: ShieldAlert,
              title: 'Hydrological Risk Scores',
              desc: 'Categorizes low-lying flood accumulation risks using real-time atmospheric saturations.',
            },
            {
              icon: Sliders,
              title: 'Climate Digital Twin',
              desc: 'Simulate artificial weather parameters in real-time to analyze environmental impacts.',
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="glass-card space-y-3">
                <div className="p-3.5 rounded-2xl bg-sky-500/5 text-sky-400 w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive Weather Projection Map */}
      <section className="space-y-4">
        <div>
          <span className="eyebrow">Geospatial telemetry</span>
          <h2 className="font-heading text-2xl font-bold text-white mt-1">Interactive Forecast Radar</h2>
        </div>
        <WeatherMap initialCity="Mumbai" />
      </section>

      {/* 5. Systems Engineering Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl font-bold text-white">Platform Architects</h2>
          <p className="text-xs text-slate-400">Developed by DSMV Labs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <DeveloperCard
            name="Devidas Kulkarni"
            role="Full Stack Architect &amp; ML Engineer"
            bio="Focusing on FastAPI microservices, ensemble scoring models, and SHAP explainability matrices."
            avatarText="DK"
          />
          <DeveloperCard
            name="Sudhanwa Kulkarni"
            role="UI/UX Designer &amp; Systems Architect"
            bio="Focusing on responsive glassmorphic layouts, dynamic UI themes, and Recharts analytics engines."
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
