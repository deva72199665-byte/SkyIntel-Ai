import React from 'react';
import Logo from './Logo';

export default function SplashScreen() {
  return (
    <main className="splash-screen">
      <div className="splash-glow" />
      <div className="relative z-10 text-center space-y-5">
        <div className="relative inline-block">
          <div className="absolute -inset-3 rounded-full bg-sky-500/20 blur-xl animate-pulse" />
          <Logo className="h-16 w-16 mx-auto relative z-10" glow={true} />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
            SkyIntel <span className="text-sky-600">AI</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">Initializing Weather Intelligence...</p>
        </div>
        <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-sky-600 animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-sky-800 bg-sky-50/80 px-3.5 py-1 rounded-full border border-sky-200/80 inline-block mt-2 shadow-sm">
          Developed by DSMV Labs
        </p>
      </div>
    </main>
  );
}
