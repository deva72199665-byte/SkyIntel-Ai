import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Sparkles, RefreshCw, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';
import api, { errorMessage } from '../api';

export default function WeatherTimeline({ initialCity = 'Delhi' }) {
  const [city, setCity] = useState(initialCity);
  const [searchCity, setSearchCity] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(1); // Default to current weather
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTimeline = async (targetCity) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/prediction-timeline', { params: { city: targetCity } });
      setTimeline(res.data.timeline || []);
      setCity(res.data.city || targetCity);
      setSelectedIdx(1); // reset to current
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCity) {
      setCity(initialCity);
      fetchTimeline(initialCity);
    }
  }, [initialCity]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchTimeline(searchCity);
      setSearchCity('');
    }
  };

  const activeNode = timeline[selectedIdx];

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-600" /> AI Weather Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive timeline sequence for <strong>{city}</strong> showing multi-factor hazards
          </p>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search City..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-sky-500 transition"
          />
          <button type="submit" disabled={loading} className="primary-button text-[11px] px-3.5 py-1.5">
            {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Scan'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
          {error}
        </div>
      )}

      {loading && timeline.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
          Retrieving timeline telemetry data...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Horizontal Scrolling Timeline Track */}
          <div className="relative flex items-center gap-1.5 overflow-x-auto pb-4 pt-2 px-1 no-scrollbar border-b border-slate-100">
            {timeline.map((node, idx) => {
              const isActive = selectedIdx === idx;
              const isPast = idx === 0;
              const isCurrent = idx === 1;

              let colorClasses = 'border-slate-200 bg-white text-slate-800 hover:border-sky-300';
              if (isActive) {
                colorClasses = 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-100';
              } else if (isCurrent) {
                colorClasses = 'border-indigo-300 bg-indigo-50/20 text-indigo-900 hover:border-indigo-400';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl border text-center w-28 transition-all ${colorClasses}`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                    isActive ? 'text-sky-700' : isCurrent ? 'text-indigo-600' : 'text-slate-400'
                  }`}>
                    {node.time_label}
                  </span>
                  <span className="font-heading text-lg font-extrabold text-slate-900 leading-none">{node.temperature}°C</span>
                  <span className="text-[10px] text-slate-500 mt-1 font-medium">Rain: {node.rain_probability}%</span>
                  
                  {/* Status indicator */}
                  <span className={`mt-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                    node.risk_level === 'High' || node.risk_level === 'Severe' 
                      ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {node.risk_level}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed analysis view of selected node */}
          {activeNode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              {/* Left col: Telemetry values */}
              <div className="md:col-span-1 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-heading text-sm font-bold text-slate-900">Telemetry Specs</h4>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{activeNode.time_label}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp</span>
                    <strong className="text-slate-900 text-sm">{activeNode.temperature}°C</strong>
                  </div>
                  <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1"><Droplets className="h-3 w-3" /> Humidity</span>
                    <strong className="text-slate-900 text-sm">{activeNode.humidity}%</strong>
                  </div>
                  <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1">🌧 Rain Rate</span>
                    <strong className="text-slate-900 text-sm">{activeNode.rainfall_rate} mm/h</strong>
                  </div>
                  <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1">⛈ Storm Prob</span>
                    <strong className="text-slate-900 text-sm">{activeNode.storm_probability}%</strong>
                  </div>
                </div>
              </div>

              {/* Middle col: Risk Indexes */}
              <div className="md:col-span-1 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-heading text-sm font-bold text-slate-900">AI Safety Indices</h4>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Hazard assessment</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-slate-500">Flood Score</span>
                    <span className={`font-bold ${activeNode.flood_risk_score > 50 ? 'text-rose-600' : 'text-slate-900'}`}>{activeNode.flood_risk_score}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-slate-500">Lightning Prob</span>
                    <span className="font-bold text-slate-900">{activeNode.lightning_probability}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-slate-500">Fog / Visibility</span>
                    <span className="font-bold text-slate-900">{activeNode.fog_probability}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-slate-500">AQI | UV Level</span>
                    <span className="font-bold text-sky-700">{activeNode.aqi_trend} | {activeNode.uv_trend}</span>
                  </div>
                </div>
              </div>

              {/* Right col: Explanations & Alerts */}
              <div className="md:col-span-1 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-heading text-sm font-bold text-slate-900">AI Model Verdict</h4>
                    <span className="text-[10px] font-bold text-sky-700 uppercase">Accuracy: {activeNode.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                    "{activeNode.explanation}"
                  </p>
                </div>

                {/* Severities alert box */}
                {(activeNode.risk_level === 'High' || activeNode.risk_level === 'Severe') ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                    <span>Extreme Hydrological Risk: Flooding likely in {city}. Avoid low-lying parking or travel.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                    <span>Safe atmospheric bounds monitored. Standard routines can proceed.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
