import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, HelpCircle, Command, X, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../api';

const TOUR_STEPS = [
  {
    title: "Welcome to SkyIntel AI! 🌤️",
    text: "This is a Next-Generation Weather Operating System. Let's take a quick 3-step tour of the platform features.",
    selector: "body"
  },
  {
    title: "AI Prediction Engine 🌧️",
    text: "Access deep ensemble learning models and SHAP Explainable AI attribution curves for rain and flood hazard predictions.",
    path: "/prediction"
  },
  {
    title: "Digital Twin Simulator 🧪",
    text: "Run interactive weather scenarios by dragging sliders. रिकैलकुलेट metrics instantly without page reloads.",
    path: "/tools"
  },
  {
    title: "Intelligent Mapping & Analytics 📊",
    text: "Overlay real-time AQI, Wind, and UV index layers on Leaflet maps and track system resources live in our Admin Console.",
    path: "/map"
  }
];

export default function PremiumUXManager() {
  const navigate = useNavigate();
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Command Search Palette State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchCmd, setSearchCmd] = useState('');

  // 1. Initial Onboarding check
  useEffect(() => {
    const completed = localStorage.getItem('skyintel_onboarding_completed');
    if (!completed) {
      setShowTour(true);
    }
  }, []);

  // 2. Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K -> Command Search Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
      // Ctrl + M -> Map
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        navigate('/map');
      }
      // Ctrl + D -> Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        navigate('/dashboard');
      }
      // Ctrl + P -> Predictions
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        navigate('/prediction');
      }
      // Ctrl + A -> Analytics
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        navigate('/analytics');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // 3. Weather theme dynamically adapted on telemetry query
  useEffect(() => {
    const fetchLatestWeatherTheme = async () => {
      try {
        const res = await api.get('/weather-history?limit=1');
        const latest = res.data?.items?.[0] || res.data?.[0];
        if (latest) {
          const desc = (latest.description || '').toLowerCase();
          const rootEl = document.getElementById('root');
          if (rootEl) {
            // Clear existing theme classes
            rootEl.classList.remove('theme-stormy', 'theme-sunny', 'theme-cloudy');
            if (desc.includes('rain') || desc.includes('drizzle') || latest.rainfall > 0) {
              rootEl.classList.add('theme-stormy');
            } else if (desc.includes('clear') || latest.temperature > 30) {
              rootEl.classList.add('theme-sunny');
            } else {
              rootEl.classList.add('theme-cloudy');
            }
          }
        }
      } catch (err) {
        // ignore
      }
    };
    fetchLatestWeatherTheme();
  }, []);

  const handleNextTour = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      const stepData = TOUR_STEPS[nextStep];
      if (stepData.path) {
        navigate(stepData.path);
      }
    } else {
      localStorage.setItem('skyintel_onboarding_completed', 'true');
      setShowTour(false);
    }
  };

  const handleCloseTour = () => {
    localStorage.setItem('skyintel_onboarding_completed', 'true');
    setShowTour(false);
  };

  // Commands List
  const commands = [
    { label: 'Go to Dashboard', path: '/dashboard', keys: 'Ctrl + D' },
    { label: 'Go to Weather Map Canvas', path: '/map', keys: 'Ctrl + M' },
    { label: 'Run AI Precipitation Inference', path: '/prediction', keys: 'Ctrl + P' },
    { label: 'Open Digital Twin Simulator', path: '/tools', keys: 'Tools tab' },
    { label: 'View Enterprise Analytics Page', path: '/analytics', keys: 'Ctrl + A' },
    { label: 'Retrain ML Models in Lab', path: '/admin', keys: 'Admin panel' },
  ];

  const filteredCmds = commands.filter((c) =>
    c.label.toLowerCase().includes(searchCmd.toLowerCase())
  );

  return (
    <>
      {/* Onboarding Tour Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-sky-100 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <span className="badge-dev py-0 px-2 text-[9px] flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-sky-600" /> Tutorial Onboarding
              </span>
              <button onClick={handleCloseTour} className="text-slate-400 hover:text-slate-700">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-heading text-base font-bold text-slate-900">
                {TOUR_STEPS[tourStep].title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {TOUR_STEPS[tourStep].text}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-slate-400 font-bold">Step {tourStep + 1} of {TOUR_STEPS.length}</span>
              <button
                onClick={handleNextTour}
                className="primary-button text-[11px] py-1.5 px-4 gap-1.5 shadow-sm"
              >
                <span>{tourStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Keyboard Shortcuts Trigger button */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="fixed bottom-6 left-6 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow hover:scale-105 transition"
        title="Keyboard Shortcuts & Commands"
      >
        <Command className="h-4.5 w-4.5" />
      </button>

      {/* Shortcuts overlay panel */}
      {showShortcuts && (
        <div className="fixed bottom-18 left-6 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Command className="h-4 w-4 text-sky-600" /> Keyboard Command palette
            </span>
            <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 font-medium text-slate-600">
            <div className="flex justify-between"><span>Ctrl + K</span> <strong className="text-slate-900 font-bold bg-slate-100 px-1 rounded">Search Palette</strong></div>
            <div className="flex justify-between"><span>Ctrl + D</span> <strong className="text-slate-900 font-bold bg-slate-100 px-1 rounded">Dashboard</strong></div>
            <div className="flex justify-between"><span>Ctrl + M</span> <strong className="text-slate-900 font-bold bg-slate-100 px-1 rounded">Weather Map</strong></div>
            <div className="flex justify-between"><span>Ctrl + P</span> <strong className="text-slate-900 font-bold bg-slate-100 px-1 rounded">AI Predictor</strong></div>
            <div className="flex justify-between"><span>Ctrl + A</span> <strong className="text-slate-900 font-bold bg-slate-100 px-1 rounded">Analytics</strong></div>
          </div>
        </div>
      )}

      {/* Command Search Palette Dialog Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Command className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Type a path command or operational action..."
                value={searchCmd}
                onChange={(e) => setSearchCmd(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button onClick={() => setShowCommandPalette(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto text-xs no-scrollbar">
              {filteredCmds.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(cmd.path);
                    setShowCommandPalette(false);
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 hover:text-sky-600 transition flex justify-between items-center"
                >
                  <span className="font-semibold text-slate-800">{cmd.label}</span>
                  <kbd className="text-[10px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded border border-slate-200">
                    {cmd.keys}
                  </kbd>
                </button>
              ))}
              {filteredCmds.length === 0 && (
                <p className="p-4 text-center text-slate-400 text-xs">No matching commands found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
