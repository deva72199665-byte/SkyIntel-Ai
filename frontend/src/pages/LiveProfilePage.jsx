import React from 'react';
import { Bell, LockKeyhole, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import api, { errorMessage } from '../api';
import useRemoteData from '../hooks/useRemoteData';

export default function LiveProfilePage({ user }) {
  const { data, loading, error } = useRemoteData(async () => {
    const res = await api.get('/users/me');
    return res.data;
  }, []);

  const profile = data || user;

  return (
    <div className="space-y-8">
      <div>
        <div className="badge-dev mb-2">
          <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
          <span>Developed by DSMV Labs</span>
        </div>
        <h1 className="page-title">User Account &amp; Profile</h1>
        <p className="page-subtitle">Authenticated user profile and session security details.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {errorMessage(error)}
        </div>
      )}

      {loading ? (
        <div className="glass p-12 text-center text-xs text-slate-500">
          Loading user profile...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="glass p-8 lg:col-span-3 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sky-600 text-2xl font-bold text-white shadow-md">
                {profile.name?.[0] || 'U'}
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">{profile.name}</h2>
                <p className="text-xs text-slate-500">{profile.email}</p>
                <span className="badge-dev mt-2 py-0.5 px-2 text-[10px]">
                  Role: {(profile.role || (profile.email?.startsWith('admin@') ? 'admin' : 'user')).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Account Status
                </span>
                <strong className="text-sm font-bold text-emerald-600">
                  {profile.is_active ? 'Active & Verified' : 'Suspended'}
                </strong>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Member Since
                </span>
                <strong className="text-sm font-bold text-slate-900">
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active Session'}
                </strong>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="glass p-6 space-y-2">
              <div className="flex items-center gap-2 text-sky-600">
                <LockKeyhole className="h-5 w-5" />
                <h3 className="card-title">JWT Security</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your session uses OAuth2 JWT Bearer Tokens with HS256 encryption. Tokens are automatically cleared on logout.
              </p>
            </div>

            <div className="glass p-6 space-y-2">
              <div className="flex items-center gap-2 text-sky-600">
                <Bell className="h-5 w-5" />
                <h3 className="card-title">Weather Notifications</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browser notification alerts are active for heavy rainfall, flood warnings, and severe weather changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
