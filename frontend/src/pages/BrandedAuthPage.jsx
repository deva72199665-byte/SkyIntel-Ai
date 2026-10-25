import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Sparkles, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import Logo from '../components/Logo';

export default function BrandedAuthPage({ onAuthenticated }) {
  const isRegister = useLocation().pathname === '/register';
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem('rain_token', data.access_token);
      onAuthenticated(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Left Side: Branding Hero */}
        <div className="bg-gradient-to-br from-sky-900 via-sky-800 to-indigo-900 p-8 sm:p-12 text-white flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center gap-3">
              <Logo />
              <div>
                <h2 className="font-heading text-xl font-bold text-white leading-none">SkyIntel AI</h2>
                <p className="text-[10px] uppercase tracking-wider text-sky-200 mt-0.5 font-medium">Weather Intelligence</p>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <div className="badge-dev bg-sky-800/80 text-sky-100 border-sky-600/50">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                <span>Developed by DSMV Labs</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Predict the weather. <br />
                <span className="text-sky-300">Control the impact.</span>
              </h1>
              <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
                Access real-time telemetry, multi-model ML predictions, SHAP Explainable AI attribution, and interactive GIS mapping.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-sky-700/60 text-xs text-sky-100/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Multi-Model ML Ensemble (RF, XGBoost, LightGBM, CatBoost)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>TreeSHAP Feature Attribution Breakdown</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Automated PDF &amp; CSV Analytical Export</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-slate-900">
              {isRegister ? 'Create SkyIntel AI Account' : 'Sign In to Dashboard'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister ? 'Register your user credentials to access weather intelligence.' : 'Enter your registered email and password.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="form-label">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="Devidas Kulkarni"
                    className="form-input pl-10"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="email"
                  placeholder="user@example.com"
                  className="form-input pl-10"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  required
                  minLength="8"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="form-input pl-10 pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="primary-button w-full py-3 mt-2">
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
              {isRegister ? 'Already registered?' : 'Don’t have an account?'}{' '}
              <Link to={isRegister ? '/login' : '/register'} className="font-bold text-sky-600 hover:underline">
                {isRegister ? 'Sign In' : 'Register Account'}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
