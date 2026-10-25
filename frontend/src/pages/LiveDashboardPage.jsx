import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  CloudRain,
  Compass,
  Download,
  Droplets,
  MapPin,
  RefreshCw,
  Shirt,
  Sparkles,
  Umbrella,
  Wind,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errorMessage } from '../api';
import useRemoteData from '../hooks/useRemoteData';
import StatusPill from '../components/StatusPill';
import WeatherMap from '../components/WeatherMap';

export default function LiveDashboardPage({ user }) {
  const { data, loading, error, reload } = useRemoteData(async () => {
    const [predictionsRes, weatherRes] = await Promise.all([
      api.get('/prediction-history?limit=10'),
      api.get('/weather-history?limit=1'),
    ]);

    const items = predictionsRes.data?.items || predictionsRes.data || [];
    const weatherItems = weatherRes.data?.items || weatherRes.data || [];
    return {
      predictions: items,
      weather: weatherItems[0] || null,
    };
  }, []);

  const latest = data?.predictions?.[0];
  const weather = data?.weather;

  const chartData = (data?.predictions || [])
    .slice()
    .reverse()
    .map((item) => ({
      time: new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      rain: item.rain_probability,
    }));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="badge-dev mb-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            <span>Developed by DSMV Labs</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome to SkyIntel AI, {user?.name?.split(' ')[0] || 'User'}.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time weather intelligence, multi-model ML predictions, and flood hazard monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={reload} disabled={loading} className="secondary-button py-2 px-3 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <Link to="/prediction" className="primary-button py-2 px-4 text-xs">
            <span>New Prediction</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {errorMessage(error)}
        </div>
      )}

      {/* Weather Alert Notification Banner (if flood risk high or severe) */}
      {latest && ['High', 'Severe'].includes(latest.flood_risk) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 flex items-center gap-3 text-rose-800 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <div className="text-xs">
            <strong className="font-bold block">Severe Weather Warning — Flood Risk Level: {latest.flood_risk}</strong>
            High probability of intense rainfall in {latest.city}. Avoid low-lying transit corridors.
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="mini-stat">
          <div className="flex items-center justify-between">
            <span>Rain Probability</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Umbrella className="h-4 w-4" />
            </div>
          </div>
          <b>{latest ? `${latest.rain_probability}%` : '—'}</b>
          <p className="text-[11px] text-slate-500">
            {latest ? `Latest for ${latest.city}` : 'Generate prediction'}
          </p>
        </div>

        <div className="mini-stat">
          <div className="flex items-center justify-between">
            <span>Flood Hazard Risk</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <b className="capitalize">{latest?.flood_risk || '—'}</b>
          <p className="text-[11px] text-slate-500">
            {latest?.flood_risk_score ? `Score: ${latest.flood_risk_score}%` : 'Multi-factor risk model'}
          </p>
        </div>

        <div className="mini-stat">
          <div className="flex items-center justify-between">
            <span>Laundry Drying</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Shirt className="h-4 w-4" />
            </div>
          </div>
          <b>{latest?.drying_condition || '—'}</b>
          <p className="text-[11px] text-slate-500">Outdoor feasibility</p>
        </div>

        <div className="mini-stat">
          <div className="flex items-center justify-between">
            <span>Wind Telemetry</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Wind className="h-4 w-4" />
            </div>
          </div>
          <b>{weather ? `${weather.wind_speed} m/s` : '—'}</b>
          <p className="text-[11px] text-slate-500">{weather ? `${weather.city} Live` : 'Live sensors'}</p>
        </div>
      </div>

      {/* Analytics Chart & Latest Guidance */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="glass p-6 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title">Rainfall Probability Trends</h3>
              <p className="text-xs text-slate-500">Historical telemetry points across saved evaluations</p>
            </div>
          </div>

          {chartData.length > 1 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="rain" stroke="#0284c7" strokeWidth={3} fill="url(#skyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 grid place-items-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Execute at least two rain predictions to view historical probability trends.
            </div>
          )}
        </div>

        {/* Latest Smart AI Guidance */}
        <div className="glass p-6 lg:col-span-2 space-y-4">
          <h3 className="card-title">Latest Smart AI Advisory</h3>
          {latest ? (
            <div className="space-y-2.5 text-xs text-slate-700">
              {Array.isArray(latest.recommendations) ? (
                latest.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-sky-600 text-white font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{rec}</p>
                  </div>
                ))
              ) : (
                <p className="p-3 rounded-xl bg-slate-50 text-slate-600">{latest.recommendations}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-10 text-center">Run your first AI prediction to view advisories.</p>
          )}
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="card-title">Recent Intelligence Runs</h3>
            <p className="text-xs text-slate-500">Saved prediction history</p>
          </div>
          <Link to="/history" className="text-xs font-semibold text-sky-600 hover:underline">
            View All History &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Evaluation Date</th>
                <th>Rain Probability</th>
                <th>Model Used</th>
                <th>Flood Risk</th>
                <th>Drying</th>
              </tr>
            </thead>
            <tbody>
              {data?.predictions?.slice(0, 4).map((item) => (
                <tr key={item.id}>
                  <td className="font-bold text-slate-900 flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-sky-600" />
                    {item.city}
                  </td>
                  <td className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="font-semibold text-slate-900">{item.rain_probability}%</td>
                  <td className="uppercase text-[11px] font-semibold text-sky-700">{item.selected_model || 'best'}</td>
                  <td><StatusPill value={item.flood_risk} /></td>
                  <td><StatusPill value={item.drying_condition} /></td>
                </tr>
              ))}
              {!data?.predictions?.length && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-slate-400">
                    No prediction history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Windy-Style Atmospheric Forecasting Radar */}
      <div className="glass p-6 space-y-4">
        <div>
          <h3 className="card-title">Atmospheric Forecasting Radar</h3>
          <p className="text-xs text-slate-500">Windy-Style Interactive Weather Visualizations and Layer Selector</p>
        </div>
        <WeatherMap initialCity="Mumbai" />
      </div>
    </div>
  );
}
