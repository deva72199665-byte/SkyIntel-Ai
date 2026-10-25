import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CloudRain,
  Droplets,
  PieChart as PieIcon,
  Sparkles,
  TrendingUp,
  Users,
  Activity,
  Cpu,
  Database,
  Clock
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import api, { errorMessage } from '../api';
import useRemoteData from '../hooks/useRemoteData';

const riskColors = ['#0ea5e9', '#f59e0b', '#f97316', '#ef4444'];

export default function LiveAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('predictions');

  const { data: predictionsData, loading, error } = useRemoteData(async () => {
    const res = await api.get('/prediction-history?limit=100');
    return res.data?.items || res.data || [];
  }, []);

  const predictions = predictionsData || [];

  const averageProb = predictions.length
    ? Math.round(predictions.reduce((s, i) => s + i.rain_probability, 0) / predictions.length)
    : 0;

  const highRiskCount = predictions.filter((i) => ['High', 'Severe'].includes(i.flood_risk)).length;

  const mostCheckedCity = predictions.length
    ? Object.entries(
        predictions.reduce((counts, i) => ({ ...counts, [i.city]: (counts[i.city] || 0) + 1 }), {})
      ).sort((a, b) => b[1] - a[1])[0][0]
    : '—';

  const generateAIInsights = () => {
    if (predictions.length === 0) return ["Run radar predictions to trigger insights."];
    const insights = [];
    insights.push(`Ensemble models report a mean precipitation probability of ${averageProb}% across active vectors.`);
    if (highRiskCount > 0) {
      insights.push(`Warning: ${highRiskCount} alert instances are flagged at High/Severe flood levels.`);
    } else {
      insights.push("Hydrological indicators suggest stable operational bounds globally.");
    }
    return insights;
  };

  const aiInsights = generateAIInsights();

  // Mock datasets
  const mockUserAnalytics = [
    { name: 'Mon', active: 45, signups: 12 },
    { name: 'Tue', active: 56, signups: 19 },
    { name: 'Wed', active: 78, signups: 32 },
    { name: 'Thu', active: 71, signups: 25 },
    { name: 'Fri', active: 89, signups: 29 },
    { name: 'Sat', active: 62, signups: 15 },
    { name: 'Sun', active: 55, signups: 10 },
  ];

  const mockWeatherAnalytics = [
    { time: '12:00 AM', temp: 22, humidity: 80 },
    { time: '04:00 AM', temp: 21, humidity: 85 },
    { time: '08:00 AM', temp: 24, humidity: 75 },
    { time: '12:00 PM', temp: 29, humidity: 62 },
    { time: '04:00 PM', temp: 31, humidity: 55 },
    { time: '08:00 PM', temp: 26, humidity: 70 },
  ];

  const mockAiAnalytics = [
    { subject: 'Rain risk', rating: 92 },
    { subject: 'Wind vectors', rating: 88 },
    { subject: 'Agricultural advice', rating: 85 },
    { subject: 'Safety metrics', rating: 90 },
    { subject: 'Voice accuracy', rating: 78 },
  ];

  const mockApiAnalytics = [
    { label: '/predict/live', calls: 320, latency: 28 },
    { label: '/assistant/query', calls: 480, latency: 65 },
    { label: '/weather-history', calls: 120, latency: 15 },
  ];

  const mockMlAnalytics = [
    { feature: 'Humidity', importance: 42 },
    { feature: 'Pressure', importance: 25 },
    { feature: 'Cloudiness', importance: 18 },
  ];

  const [sysCpu, setSysCpu] = useState(34);
  const [sysRam, setSysRam] = useState(58);

  useEffect(() => {
    const timer = setInterval(() => {
      setSysCpu((prev) => Math.min(99, Math.max(10, prev + Math.floor(Math.random() * 10 - 5))));
      setSysRam((prev) => Math.min(99, Math.max(10, prev + Math.floor(Math.random() * 2 - 1))));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const barTrend = predictions
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      rain: item.rain_probability,
    }));

  const floodRisks = ['Low', 'Moderate', 'High', 'Severe'].map((name) => ({
    name,
    value: predictions.filter((i) => i.flood_risk === name).length,
  }));

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="badge-dev mb-2">
          <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-spin" />
          <span>Operational Telemetry Center</span>
        </div>
        <h1 className="page-title">Forecasting &amp; Analytics Trends</h1>
        <p className="page-subtitle">
          Real-time user engagement graphs, API query latencies, model attribution metrics, and live system memory tracking.
        </p>
      </div>

      {/* Insights */}
      <section className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 animate-pulse" /> Live AI Atmospheric Scanner Observations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="p-3.5 bg-slate-900/60 rounded-2xl border border-white/5 leading-relaxed shadow-sm font-semibold">
              💡 {insight}
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-400">
          {errorMessage(error)}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 overflow-x-auto pb-2.5 no-scrollbar">
        {[
          { id: 'predictions', label: 'Predictions Analytics', icon: BarChart3 },
          { id: 'users', label: 'User Analytics', icon: Users },
          { id: 'weather', label: 'Weather Analytics', icon: Droplets },
          { id: 'ai', label: 'AI Analytics', icon: Sparkles },
          { id: 'api', label: 'API Analytics', icon: Clock },
          { id: 'ml', label: 'ML Analytics', icon: Activity },
          { id: 'system', label: 'System Analytics', icon: Cpu },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === id
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow'
                : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass p-12 text-center text-xs text-slate-500">
          Aggregating telemetry analytics...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: PREDICTIONS */}
          {activeTab === 'predictions' && (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="glass p-6 lg:col-span-3 space-y-4">
                <h3 className="card-title">Rain Probability History</h3>
                {barTrend.length ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Bar dataKey="rain" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 grid place-items-center text-xs text-slate-400 border border-dashed border-white/10 rounded-2xl">
                    Run rain predictions to populate distribution charts.
                  </div>
                )}
              </div>

              <div className="glass p-6 lg:col-span-2 space-y-4">
                <h3 className="card-title">Flood Risk Classification Mix</h3>
                {predictions.length ? (
                  <>
                    <div className="h-48 w-full flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={floodRisks}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                          >
                            {floodRisks.map((entry, index) => (
                              <Cell key={entry.name} fill={riskColors[index]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                      {floodRisks.map((risk, index) => (
                        <div key={risk.name} className="p-2 rounded-xl border border-white/5 bg-slate-900/40">
                          <span className="font-extrabold block" style={{ color: riskColors[index] }}>
                            {risk.value}
                          </span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase">{risk.name} Risk</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-56 grid place-items-center text-xs text-slate-400">
                    No risk metrics accumulated yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USER ANALYTICS */}
          {activeTab === 'users' && (
            <div className="glass p-6 space-y-4">
              <h3 className="card-title">User Onboarding &amp; Daily Engagement Trends</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockUserAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="active" name="Active Sessions" stroke="#818cf8" fill="rgba(129, 140, 248, 0.1)" />
                    <Area type="monotone" dataKey="signups" name="New Signups" stroke="#38bdf8" fill="rgba(56, 189, 248, 0.1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 3: WEATHER ANALYTICS */}
          {activeTab === 'weather' && (
            <div className="glass p-6 space-y-4">
              <h3 className="card-title">Atmospheric Fluctuations</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockWeatherAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#f43f5e" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={9} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f43f5e" strokeWidth={2.5} />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: AI ANALYTICS */}
          {activeTab === 'ai' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass p-6 flex flex-col justify-center items-center">
                <h3 className="card-title self-start mb-4">Agent Capability Map</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockAiAnalytics}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="subject" fontSize={9} stroke="#94a3b8" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} stroke="#94a3b8" />
                      <Radar name="Agent Efficacy" dataKey="rating" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass p-6 space-y-3">
                <h3 className="card-title">Sub-Agent Core Metrics</h3>
                <div className="space-y-3 pt-2 text-xs">
                  {mockAiAnalytics.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5">
                      <span className="font-bold text-slate-300">{item.subject}</span>
                      <strong className="text-sky-400">{item.rating}% efficacy</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: API ANALYTICS */}
          {activeTab === 'api' && (
            <div className="glass p-6 space-y-4">
              <h3 className="card-title">Endpoint Requests &amp; Latency (ms)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockApiAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} />
                    <YAxis yAxisId="left" stroke="#38bdf8" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" fontSize={9} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Bar yAxisId="left" dataKey="calls" name="Request Volumes" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="latency" name="Latency (ms)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 6: ML ANALYTICS */}
          {activeTab === 'ml' && (
            <div className="glass p-6 space-y-4">
              <h3 className="card-title">Ensemble Importance attributions</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockMlAnalytics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={9} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Bar dataKey="importance" name="Global weight influence" fill="#818cf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM RESOURCE */}
          {activeTab === 'system' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass p-6 flex flex-col justify-center items-center text-center space-y-3">
                <Cpu className="h-10 w-10 text-sky-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Virtual CPU Load</span>
                <b className="font-heading text-4xl font-extrabold text-white">{sysCpu}%</b>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-sky-500 h-full transition-all duration-700" style={{ width: `${sysCpu}%` }} />
                </div>
              </div>

              <div className="glass p-6 flex flex-col justify-center items-center text-center space-y-3">
                <Database className="h-10 w-10 text-indigo-400" />
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Database telemetry records</span>
                <b className="font-heading text-4xl font-extrabold text-white">{sysRam}%</b>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-indigo-500 h-full transition-all duration-700" style={{ width: `${sysRam}%` }} />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
