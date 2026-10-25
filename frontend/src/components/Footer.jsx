import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Logo from './Logo';

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

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        
        {/* Brand identity block */}
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <div>
            <p className="font-extrabold text-slate-900 text-sm leading-tight">
              SkyIntel <span className="text-sky-600">AI</span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              © 2026 Weather Intelligence Platform — Crafted by <strong className="text-slate-800 font-semibold">DSMV Labs</strong>
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex flex-wrap items-center gap-6 font-semibold text-slate-600">
          <Link to="/about" className="hover:text-sky-600 transition">About</Link>
          <Link to="/developer" className="hover:text-sky-600 transition">Developers</Link>
          <Link to="/credits" className="hover:text-sky-600 transition">Credits &amp; License</Link>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="GitHub Repository"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="LinkedIn Profile"
          >
            <LinkedinIcon className="h-4 w-4" />
          </a>
          <a
            href="mailto:contact@skyintel.ai"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Email Contact"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
