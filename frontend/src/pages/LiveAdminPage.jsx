import React, { useEffect, useState } from 'react';
import {
  Activity,
  BrainCircuit,
  CloudRain,
  Compass,
  Cpu,
  Database,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  UserX,
  AlertTriangle,
  Send,
  Flag,
  Globe
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api, { errorMessage } from '../api';
import ModelLabPanel from '../components/ModelLabPanel';

// Simulated online user geo pins for map
const ACTIVE_USER_LOCATIONS = [
  { name: "John Doe (Analyst)", email: "john@skyintel.ai", city: "Mumbai", coords: [19.076, 72.8777] },
  { name: "Alice Smith (Supervisor)", email: "alice@skyintel.ai", city: "Delhi", coords: [28.6139, 77.209] },
  { name: "Bob Johnson (Operations)", email: "bob@skyintel.ai", city: "Chennai", coords: [13.0827, 80.2707] },
];

export default function LiveAdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Super Admin Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetPhrase, setResetPhrase] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Broadcast & Threat States
  const [threats, setThreats] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const handlePlatformReset = async () => {
    if (resetPhrase !== 'DELETE EVERYTHING' || !resetPassword) return;
    setResetLoading(true);
    try {
      const res = await api.post('/admin/reset-platform', {
        password: resetPassword,
        confirm_phrase: resetPhrase,
      });
      alert(res.data.message || 'SkyIntel AI Platform reset complete.');
      setShowResetModal(false);
      loadData();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    if (!alertMsg.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.post('/admin/broadcast-alert', null, {
        params: { message: alertMsg, severity: alertSeverity }
      });
      setActiveAlert(res.data);
      setAlertMsg('');
      alert('Active warning alert broadcasted globally.');
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAlert = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/admin/broadcast-alert/clear');
      setActiveAlert(res.data);
      alert('Broadcast alert cleared.');
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, statsRes, threatsRes, alertRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/security-threats').catch(() => ({ data: [] })),
        api.get('/admin/active-alert').catch(() => ({ data: { message: null } })),
      ]);
      setUsers(usersRes.data || []);
      setStats(statsRes.data || null);
      setThreats(threatsRes.data || []);
      setActiveAlert(alertRes.data || null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (userId) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${userId}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (actionLoading) return;
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => (prev ? { ...prev, total_users: prev.total_users - 1 } : null));
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="badge-dev mb-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-spin" />
            <span>Operational Console</span>
          </div>
          <h1 className="page-title">Admin Management Telemetry</h1>
          <p className="page-subtitle">
            Configure system configurations, manage users database, and broadcast alerts marquee banners.
          </p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow transition self-start"
        >
          Reset platform database
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-400 font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass p-12 text-center text-xs text-slate-500">
          Loading administration console...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="mini-stat">
                <div className="flex items-center justify-between">
                  <span>Registered Users</span>
                  <Users className="h-4 w-4 text-sky-400" />
                </div>
                <b>{stats.total_users}</b>
                <p className="text-[11px] text-slate-400">Active accounts</p>
              </div>

              <div className="mini-stat">
                <div className="flex items-center justify-between">
                  <span>Total Predictions</span>
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <b>{stats.total_predictions}</b>
                <p className="text-[11px] text-slate-400 font-medium">Inferences run</p>
              </div>

              <div className="mini-stat">
                <div className="flex items-center justify-between">
                  <span>Observations</span>
                  <CloudRain className="h-4 w-4 text-amber-400" />
                </div>
                <b>{stats.total_weather_records}</b>
                <p className="text-[11px] text-slate-400">Telemetry points</p>
              </div>

              <div className="mini-stat">
                <div className="flex items-center justify-between">
                  <span>Resource status</span>
                  <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                </div>
                <b className="text-sm font-semibold uppercase">{stats.server_health?.status === 'healthy' ? 'STABLE' : 'UNSTABLE'}</b>
                <p className="text-[11px] text-slate-400">API health logs</p>
              </div>
            </div>
          )}

          {/* User Session map & Alert panel */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Map (col-span-3) */}
            <div className="lg:col-span-3 glass p-6 space-y-4">
              <h3 className="card-title flex items-center gap-1.5"><Globe className="h-4.5 w-4.5 text-sky-400" /> Live online operator locations</h3>
              <div className="h-64 rounded-2xl border border-white/10 overflow-hidden z-0">
                <MapContainer center={[20.5937, 78.9629]} zoom={3} scrollWheelZoom={true} className="h-full w-full map-dark-skin">
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; CARTO"
                  />
                  {ACTIVE_USER_LOCATIONS.map((u, idx) => (
                    <Marker key={idx} position={u.coords}>
                      <Popup>
                        <div className="text-xs font-sans text-slate-900 p-1">
                          <p className="font-bold">{u.name}</p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Warning Broadcast (col-span-2) */}
            <div className="lg:col-span-2 glass p-6 space-y-4">
              <h3 className="card-title flex items-center gap-1.5"><Flag className="h-4.5 w-4.5 text-indigo-400" /> Platform Warning Broadcast</h3>
              
              <form onSubmit={handleBroadcastAlert} className="space-y-3 text-xs">
                <div>
                  <label className="form-label block mb-1">Warning Message</label>
                  <textarea
                    rows="2"
                    placeholder="Enter warning message (e.g. Critical storm coordinates)..."
                    value={alertMsg}
                    onChange={(e) => setAlertMsg(e.target.value)}
                    className="form-input text-xs w-full outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="form-label block mb-1">Severity scale</label>
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value)}
                    className="form-input text-xs w-full cursor-pointer"
                  >
                    <option value="info" className="bg-slate-900 text-white">Info (Blue)</option>
                    <option value="warning" className="bg-slate-900 text-white">Warning (Orange)</option>
                    <option value="critical" className="bg-slate-900 text-white">Critical (Red)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={actionLoading || !alertMsg.trim()}
                  className="primary-button text-xs w-full py-2.5 justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Broadcast Warning
                </button>
              </form>

              {activeAlert && activeAlert.message && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  activeAlert.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                  activeAlert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-sky-500/10 border-sky-500/20 text-sky-400'
                }`}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold block uppercase text-[9px]">Active warning:</span>
                    <p className="mt-0.5">{activeAlert.message}</p>
                    <button onClick={handleClearAlert} className="underline text-[10px] font-bold mt-2 block hover:text-white">
                      Clear warning
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Threat Logs & Accounts database */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Threats (col-span-2) */}
            <div className="lg:col-span-2 glass p-6 space-y-4">
              <h3 className="card-title flex items-center gap-1.5"><ShieldAlert className="h-4.5 w-4.5 text-rose-500" /> Intrusion threat telemetry</h3>
              <div className="space-y-3 overflow-y-auto max-h-72 pr-1 text-xs no-scrollbar">
                {threats.map((t, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-900/40 border border-white/5 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-slate-500 font-bold">{t.timestamp}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 text-rose-400">
                        {t.risk_level}
                      </span>
                    </div>
                    <p className="font-bold text-white">{t.event}</p>
                    <p className="text-[9px] text-slate-400 font-medium">Origin: {t.source}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Users (col-span-3) */}
            <div className="lg:col-span-3 glass overflow-hidden">
              <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                <h3 className="card-title">User accounts</h3>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input pl-9 text-[11px] py-1.5"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="data-table text-xs">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isUserAdmin = u.email.toLowerCase().startsWith('admin@') || u.role === 'admin' || u.role === 'super_admin';
                      return (
                        <tr key={u.id} className="border-b border-white/5">
                          <td className="font-bold text-white">{u.name}</td>
                          <td className="text-slate-400 truncate max-w-[120px]">{u.email}</td>
                          <td>
                            <span className="uppercase text-[8px] font-bold text-sky-400 bg-sky-500/5 px-2 py-0.5 rounded border border-sky-500/10">
                              {u.role || 'user'}
                            </span>
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-500'
                            }`}>
                              {u.is_active ? 'Active' : 'Banned'}
                            </span>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled={isUserAdmin || actionLoading}
                                onClick={() => handleToggleActive(u.id)}
                                className={`p-1.5 rounded-lg border text-xs transition ${
                                  u.is_active ? 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-400' : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400'
                                }`}
                                title={u.is_active ? 'Deactivate' : 'Activate'}
                              >
                                {u.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                disabled={isUserAdmin || actionLoading}
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 rounded-lg border border-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                                title="Delete Permanently"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI Model Laboratory Panel */}
          <div className="glass p-6">
            <ModelLabPanel />
          </div>
        </>
      )}

      {/* Super Admin Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-500 font-bold border-b border-white/5 pb-3">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
              <h3 className="font-heading text-base font-bold text-white">Critical Platform Reset</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="form-label">Password verification</label>
                <input
                  type="password"
                  placeholder="Enter administrator password..."
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label">Confirmation Phrase: <strong className="text-rose-400">DELETE EVERYTHING</strong></label>
                <input
                  type="text"
                  placeholder="DELETE EVERYTHING"
                  value={resetPhrase}
                  onChange={(e) => setResetPhrase(e.target.value)}
                  className="form-input text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setShowResetModal(false)} className="secondary-button text-xs flex-1 py-2.5 bg-white/5 border-white/5 hover:bg-white/10">
                Cancel
              </button>
              <button
                disabled={resetLoading || resetPhrase !== 'DELETE EVERYTHING' || !resetPassword}
                onClick={handlePlatformReset}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex-1 transition"
              >
                {resetLoading ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
