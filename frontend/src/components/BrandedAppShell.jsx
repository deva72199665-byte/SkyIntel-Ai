import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CloudRain,
  Compass,
  History,
  Info,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShieldAlert,
  Sparkles,
  UserRound,
  Users,
  AlertTriangle,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import Logo from './Logo';
import Footer from './Footer';
import AiAssistantWidget from './AiAssistantWidget';
import PremiumUXManager from './PremiumUXManager';
import api from '../api';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/prediction', label: 'AI Prediction', icon: CloudRain },
  { to: '/tools', label: 'AI Copilot Suite', icon: Sparkles },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/history', label: 'History', icon: History },
  { to: '/developer', label: 'Developers', icon: Users },
  { to: '/credits', label: 'Credits', icon: Info },
];

export default function BrandedAppShell({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const signOut = () => {
    onLogout();
    navigate('/login');
  };

  const isAdmin = user?.email?.toLowerCase().startsWith('admin@') || user?.role === 'admin';
  const activeLinks = isAdmin
    ? [
        ...links.slice(0, 3),
        { to: '/admin', label: 'Admin Panel', icon: ShieldAlert },
        ...links.slice(3),
      ]
    : links;

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await api.get('/admin/active-alert');
        if (res.data && res.data.message) {
          setActiveAlert(res.data);
        } else {
          setActiveAlert(null);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchAlert();
    const interval = setInterval(fetchAlert, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row relative">
      
      {/* 1. Desktop Floating Left Sidebar (Hidden on Mobile) */}
      <aside className={`hidden lg:flex fixed left-6 top-6 bottom-6 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl p-5 z-40 flex-col justify-between transition-all duration-300 ${
        isSidebarExpanded ? 'w-64' : 'w-20'
      }`}>
        <div className="space-y-6">
          {/* Logo & Expand Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            {isSidebarExpanded ? <Brand /> : <Logo className="h-8 w-8 mx-auto" />}
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            >
              {isSidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* User Profile Summary */}
          {isSidebarExpanded && (
            <div onClick={() => navigate('/profile')} className="flex items-center gap-3 p-3 bg-slate-100/50 rounded-2xl cursor-pointer hover:bg-slate-100 transition">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-sky-600 font-bold text-white text-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-slate-800">{user?.name}</span>
                <span className="block text-[9px] text-slate-500 font-medium truncate">{user?.email}</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {activeLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/15'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {isSidebarExpanded && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer controls inside sidebar */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {isSidebarExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Floating Header & Bottom Bar Navigation */}
      <div className="lg:hidden w-full z-40 bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0">
        <Brand />
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/profile')}
            className="grid h-8 w-8 place-items-center rounded-xl bg-sky-600 font-bold text-white text-xs"
          >
            {user?.name?.[0] || 'U'}
          </button>
          <button
            onClick={signOut}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Floating Navigation Dock (Bottom of screen) */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200 z-40 flex items-center justify-around px-2 shadow-2xl">
        {activeLinks.slice(0, 5).map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `p-3 rounded-xl transition ${
                isActive ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500'
              }`
            }
          >
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
      </nav>

      {/* 3. Main Content Container (Pushed on desktop to avoid sidebar overlay) */}
      <div className={`flex-1 flex flex-col justify-between min-h-screen transition-all duration-300 ${
        isSidebarExpanded ? 'lg:pl-76' : 'lg:pl-32'
      }`}>
        <div className="w-full">
          {/* Emergency Alert Marquee Warning Banner */}
          {activeAlert && activeAlert.message && (
            <div className={`py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 animate-pulse ${
              activeAlert.severity === 'critical' ? 'bg-rose-600/90 text-white' :
              activeAlert.severity === 'warning' ? 'bg-amber-500/90 text-white' :
              'bg-sky-600/90 text-white'
            }`}>
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>EMERGENCY CRITICAL ADVISORY: {activeAlert.message}</span>
            </div>
          )}

          {/* Core Page Router Content */}
          <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
            <Outlet />
          </main>
        </div>

        {/* AI Assistant Widget */}
        <AiAssistantWidget />

        {/* Global UX enhancements (Shortcuts, Command Palettes) */}
        <PremiumUXManager />

        <Footer />
      </div>
    </div>
  );
}
