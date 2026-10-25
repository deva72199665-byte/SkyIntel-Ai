import React from 'react';
import {
  BrainCircuit,
  Code2,
  Cpu,
  FileText,
  GraduationCap,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function DeveloperPage() {
  const developers = [
    {
      name: 'Devidas Kulkarni',
      role: 'Lead AI Architect & Senior Full-Stack Developer',
      avatarText: 'DK',
      skills: ['FastAPI', 'React 18', 'Machine Learning', 'SQLAlchemy', 'SHAP', 'System Architecture'],
      bio: 'Specializing in end-to-end AI platform development, predictive modeling, backend performance engineering, and SaaS system design.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'devidas@skyintel.ai',
    },
    {
      name: 'Sudhanwa Kulkarni',
      role: 'Senior ML Engineer & Data Pipeline Specialist',
      avatarText: 'SK',
      skills: ['Python', 'XGBoost', 'CatBoost', 'Geospatial GIS', 'Data Visualization', 'PWA Engineering'],
      bio: 'Passionate about advanced algorithmic modeling, weather telemetry ingestion, explainable AI diagnostics, and responsive UI UX.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'sudhanwa@skyintel.ai',
    },
    {
      name: 'Mohammed Musaddiq',
      role: 'Associate Software Engineer & Frontend Specialist',
      avatarText: 'MM',
      skills: ['React 18', 'TailwindCSS', 'CSS3', 'PWA Engineering', 'Responsive Design', 'UX Optimization'],
      bio: 'Focused on building accessible, performant frontend architectures, responsive user interfaces, and custom visual components.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'musaddiq@skyintel.ai',
    },
    {
      name: 'Vedant Rajegore',
      role: 'Backend Engineer & Database Specialist',
      avatarText: 'VR',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', 'SQLAlchemy', 'API Routing'],
      bio: 'Specializing in backend system design, database schema optimization, pipeline scalability, and API route security.',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'vedant@skyintel.ai',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <span className="eyebrow">DEVELOPER SHOWCASE</span>
        <h1 className="page-title">
          Crafted by <span className="text-gradient">DSMV Labs</span>
        </h1>
        <p className="page-subtitle">
          Meet the software architects and AI engineers behind SkyIntel AI — Weather Intelligence Platform.
        </p>
      </div>

      {/* Developer Profiles Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {developers.map((dev) => (
          <div key={dev.name} className="developer-card flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="developer-avatar">{dev.avatarText}</div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900">{dev.name}</h2>
                    <p className="text-xs font-semibold text-sky-600">{dev.role}</p>
                  </div>
                </div>
                <span className="badge-dev">Co-Creator</span>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-600">{dev.bio}</p>

              {/* Skills Tags */}
              <div className="mt-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Core Skills &amp; Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dev.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Social & Resume Links */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  title="GitHub Profile"
                >
                  <GithubIcon className="h-4 w-4" />
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  title="LinkedIn Profile"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${dev.email}`}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  title="Direct Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => alert(`Downloading CV for ${dev.name}...`)}
                className="secondary-button py-1.5 px-3 text-xs"
              >
                <FileText className="h-3.5 w-3.5 text-sky-600" />
                Resume / CV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Vision & Statistics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-sky-600" />
            <h3 className="card-title">SkyIntel AI Project Vision</h3>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            SkyIntel AI was conceptualized to bridge the gap between raw meteorological data and actionable human lifestyle decisions. By synthesizing multi-model machine learning ensemble evaluation with SHAP Explainable AI attribution, SkyIntel AI provides individuals, city planners, and agricultural stakeholders with transparent, dependable rain probability and flood hazard risk metrics.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">ML Models</span>
              <strong className="text-lg font-bold text-slate-900 font-heading">6 Algorithms</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">XAI Transparency</span>
              <strong className="text-lg font-bold text-slate-900 font-heading">TreeSHAP</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">Map Layering</span>
              <strong className="text-lg font-bold text-slate-900 font-heading">Leaflet GIS</strong>
            </div>
          </div>
        </div>

        <div className="glass p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="card-title">Key Achievements</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
              <span>Multi-model automated training pipeline with top model selection.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
              <span>Integrated SHAP feature attribution graphs for zero black-box predictions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
              <span>Automated PDF &amp; CSV report generator for desktop and mobile.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
              <span>PWA compliance with offline service worker caching.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
