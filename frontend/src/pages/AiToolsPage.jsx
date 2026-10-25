import React, { useState, useEffect } from 'react';
import { Sliders, Plane, Sprout, Activity, HeartPulse, Sparkles, Send, ShieldAlert, Thermometer, Droplets, Wind } from 'lucide-react';
import api, { errorMessage } from '../api';
import ShapExplanationChart from '../components/ShapExplanationChart';

export default function AiToolsPage() {
  const [activeTab, setActiveTab] = useState('simulator');

  // Simulator State
  const [simForm, setSimForm] = useState({
    temperature: 28.0,
    humidity: 78.0,
    pressure: 1008.0,
    wind_speed: 12.0,
    rainfall: 8.5,
    cloudiness: 80.0,
    model: 'ensemble',
  });
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Trip Planner State
  const [tripDest, setTripDest] = useState('Goa');
  const [tripResult, setTripResult] = useState(null);
  const [tripLoading, setTripLoading] = useState(false);

  // Farming Advisor State
  const [farmCity, setFarmCity] = useState('Punjab');
  const [cropType, setCropType] = useState('Wheat / Paddy');
  const [farmResult, setFarmResult] = useState(null);
  const [farmLoading, setFarmLoading] = useState(false);

  // Outdoor Activities State
  const [actCity, setActCity] = useState('Mumbai');
  const [actResult, setActResult] = useState(null);
  const [actLoading, setActLoading] = useState(false);

  // Health Advisory State
  const [healthCity, setHealthCity] = useState('Delhi');
  const [healthResult, setHealthResult] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await api.post('/tools/simulate', simForm);
      setSimResult(res.data);
    } catch (err) {
      // Quiet error for debounced background runs
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'simulator') {
      const timer = setTimeout(() => {
        handleSimulate();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [simForm, activeTab]);

  const handleTripPlan = async (e) => {
    e.preventDefault();
    setTripLoading(true);
    try {
      const res = await api.post('/tools/trip-planner', { destination: tripDest });
      setTripResult(res.data);
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setTripLoading(false);
    }
  };

  const handleFarmPlan = async (e) => {
    e.preventDefault();
    setFarmLoading(true);
    try {
      const res = await api.post('/tools/farming-advisor', { city: farmCity, crop_type: cropType });
      setFarmResult(res.data);
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setFarmLoading(false);
    }
  };

  const handleFetchActivities = async (e) => {
    if (e) e.preventDefault();
    setActLoading(true);
    try {
      const res = await api.get('/tools/outdoor-activities', { params: { city: actCity } });
      setActResult(res.data);
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setActLoading(false);
    }
  };

  const handleFetchHealth = async (e) => {
    if (e) e.preventDefault();
    setHealthLoading(true);
    try {
      const res = await api.get('/tools/health-advisory', { params: { city: healthCity } });
      setHealthResult(res.data);
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setHealthLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            <span>AI Copilot &amp; Simulation Engine</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            SkyIntel <span className="text-gradient">AI Tools Suite</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Run "What-If" weather simulations, generate AI trip plans, agriculture advisories, and outdoor activity scores.
          </p>
        </div>
      </section>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'simulator', label: '"What-If" Simulator', icon: Sliders },
          { id: 'trip', label: 'AI Trip Planner', icon: Plane },
          { id: 'farming', label: 'Farming Advisor', icon: Sprout },
          { id: 'activities', label: 'Outdoor Activities', icon: Activity },
          { id: 'health', label: 'Health & Biological', icon: HeartPulse },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition ${
              activeTab === id
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: WHAT-IF SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="glass-card p-6 space-y-5 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-600" /> Simulation Sliders
              </h3>
              <span className="badge-dev py-0.5 px-2 text-[10px]">Multi-Model Ensemble</span>
            </div>

            {/* Sliders */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Temperature (°C)</span>
                  <strong className="text-sky-700">{simForm.temperature}°C</strong>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="50"
                  step="0.5"
                  value={simForm.temperature}
                  onChange={(e) => setSimForm({ ...simForm, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Humidity (%)</span>
                  <strong className="text-sky-700">{simForm.humidity}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={simForm.humidity}
                  onChange={(e) => setSimForm({ ...simForm, humidity: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Barometric Pressure (hPa)</span>
                  <strong className="text-sky-700">{simForm.pressure} hPa</strong>
                </div>
                <input
                  type="range"
                  min="970"
                  max="1040"
                  step="1"
                  value={simForm.pressure}
                  onChange={(e) => setSimForm({ ...simForm, pressure: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Wind Speed (m/s)</span>
                  <strong className="text-sky-700">{simForm.wind_speed} m/s</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={simForm.wind_speed}
                  onChange={(e) => setSimForm({ ...simForm, wind_speed: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Rainfall Rate (mm/h)</span>
                  <strong className="text-sky-700">{simForm.rainfall} mm</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={simForm.rainfall}
                  onChange={(e) => setSimForm({ ...simForm, rainfall: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Cloudiness (%)</span>
                  <strong className="text-sky-700">{simForm.cloudiness}%</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={simForm.cloudiness}
                  onChange={(e) => setSimForm({ ...simForm, cloudiness: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <div className={`p-3 rounded-xl border text-center transition ${
                  simLoading ? 'bg-sky-50 border-sky-100 text-sky-700 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">Recalculation Status</span>
                  <span className="text-xs font-semibold">{simLoading ? '🤖 Compute Core Syncing...' : '✓ Twin State Synchronized'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-2 space-y-6">
            {simResult ? (
              <div className="space-y-6">
                {/* KPI Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="mini-stat">
                    <span>Rain Probability</span>
                    <b className="text-sky-600">{simResult.rain_probability}%</b>
                  </div>
                  <div className="mini-stat">
                    <span>AI Confidence</span>
                    <b className="text-indigo-600">{simResult.prediction_confidence}%</b>
                  </div>
                  <div className="mini-stat">
                    <span>Flood Risk</span>
                    <b className="text-amber-600">{simResult.flood_risk}</b>
                  </div>
                  <div className="mini-stat">
                    <span>Severity Score</span>
                    <b className="text-rose-600">{simResult.weather_severity_score}/100</b>
                  </div>
                </div>

                {/* AI Decision Engine Output */}
                <div className="glass-card p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="font-heading text-sm font-bold text-slate-900">
                      AI Decision Engine Diagnostics
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      simResult.impact_level === 'Extreme' || simResult.impact_level === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {simResult.impact_level} Impact
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 p-3.5 rounded-xl leading-relaxed">
                    <strong>AI Analyst Explanation:</strong> {simResult.explanation}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800">Advisory Action Plan</h4>
                      {(Array.isArray(simResult.recommended_actions)
                        ? simResult.recommended_actions
                        : (typeof simResult.recommended_actions === 'string'
                            ? simResult.recommended_actions.split('.').map(s => s.trim()).filter(Boolean)
                            : [])
                      ).map((rec, idx) => (
                        <div key={idx} className="flex gap-2 text-slate-600">
                          <span className="text-emerald-500 font-bold">•</span>
                          <p>{rec}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800">Alternative Options</h4>
                      {simResult.alternative_suggestions?.map((alt, idx) => (
                        <div key={idx} className="flex gap-2 text-slate-600">
                          <span className="text-sky-500 font-bold">➔</span>
                          <p>{alt}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div>
                      <span>Expected Duration: </span>
                      <strong className="text-slate-700">{simResult.expected_duration}</strong>
                    </div>
                    <div>
                      <span>Similar Historical Event: </span>
                      <strong className="text-slate-700">{simResult.similar_historical_events}</strong>
                    </div>
                  </div>
                </div>

                {/* SHAP Chart */}
                <div className="glass-card p-6">
                  <h3 className="font-heading text-sm font-bold text-slate-900 mb-4">
                    Simulated SHAP Feature Attribution Breakdown
                  </h3>
                  <ShapExplanationChart explanations={simResult.shap_explainability} />
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-slate-500 space-y-3">
                <Sliders className="h-12 w-12 mx-auto text-sky-600 opacity-40 animate-pulse" />
                <h3 className="font-heading text-lg font-bold text-slate-900">Ready for Weather Simulation</h3>
                <p className="text-xs max-w-md mx-auto">
                  Adjust meteorological sliders on the left to test hypothetical climate events against SkyIntel AI's soft-voting ensemble model. Recalculation triggers instantly!
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: TRIP PLANNER */}
      {activeTab === 'trip' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <form onSubmit={handleTripPlan} className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-600" /> AI Destination Trip Planner
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter destination city (e.g. Goa, Paris, Tokyo)..."
                value={tripDest}
                onChange={(e) => setTripDest(e.target.value)}
                className="form-input flex-1 text-xs"
              />
              <button type="submit" disabled={tripLoading} className="primary-button text-xs px-5">
                Generate Plan
              </button>
            </div>
          </form>

          {tripResult && (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900">{tripResult.destination} Trip Analysis</h3>
                  <p className="text-xs text-sky-700 font-semibold">{tripResult.verdict}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Feasibility Score</span>
                  <span className="font-heading text-3xl font-extrabold text-sky-600">{tripResult.travel_feasibility_score}/100</span>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <h4 className="font-heading text-sm font-bold text-slate-900 mb-2">Recommended Packing Checklist</h4>
                <div className="flex flex-wrap gap-2">
                  {tripResult.packing_checklist.map((item, idx) => (
                    <span key={idx} className="badge-dev text-xs px-3 py-1 bg-sky-50 text-sky-800 border-sky-200">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FARMING ADVISOR */}
      {activeTab === 'farming' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <form onSubmit={handleFarmPlan} className="glass-card p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-600" /> AI Agriculture &amp; Farming Advisor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Target Region / City</label>
                <input
                  type="text"
                  value={farmCity}
                  onChange={(e) => setFarmCity(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="form-label">Crop Category</label>
                <input
                  type="text"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
            </div>
            <button type="submit" disabled={farmLoading} className="primary-button text-xs w-full py-2.5">
              Analyze Agriculture Telemetry
            </button>
          </form>

          {farmResult && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                Agricultural Guidance for {farmResult.city} ({farmResult.crop_type})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <span className="text-emerald-800 font-bold uppercase tracking-wider block mb-1">Irrigation Status</span>
                  <p className="text-slate-900 font-semibold">{farmResult.irrigation_status}</p>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
                  <span className="text-amber-800 font-bold uppercase tracking-wider block mb-1">Pest &amp; Blight Risk</span>
                  <p className="text-slate-900 font-semibold">{farmResult.pest_fungal_risk}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OUTDOOR ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <form onSubmit={handleFetchActivities} className="glass-card p-6 flex gap-2">
            <input
              type="text"
              placeholder="City for activity scoring (e.g. Mumbai)..."
              value={actCity}
              onChange={(e) => setActCity(e.target.value)}
              className="form-input flex-1 text-xs"
            />
            <button type="submit" disabled={actLoading} className="primary-button text-xs px-5">
              Calculate Scores
            </button>
          </form>

          {actResult && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                Outdoor Suitability Scores for {actResult.city}
              </h3>
              <div className="space-y-3 text-xs">
                {actResult.activities.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/80">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{item.status}</span>
                      <strong className="font-heading text-base text-sky-600">{item.score}/100</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HEALTH ADVISORY */}
      {activeTab === 'health' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <form onSubmit={handleFetchHealth} className="glass-card p-6 flex gap-2">
            <input
              type="text"
              placeholder="City for biological health advisory (e.g. Delhi)..."
              value={healthCity}
              onChange={(e) => setHealthCity(e.target.value)}
              className="form-input flex-1 text-xs"
            />
            <button type="submit" disabled={healthLoading} className="primary-button text-xs px-5">
              Generate Health Report
            </button>
          </form>

          {healthResult && (
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                Biological Health Advisory for {healthResult.city}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-sky-200 bg-sky-50">
                  <span className="text-sky-800 font-bold uppercase tracking-wider block mb-1">Recommended Daily Hydration</span>
                  <p className="text-2xl font-bold text-sky-900">{healthResult.hydration_recommendation_liters} Liters / day</p>
                </div>
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50">
                  <span className="text-indigo-800 font-bold uppercase tracking-wider block mb-1">Barometric Joint Discomfort</span>
                  <p className="text-2xl font-bold text-indigo-900">{healthResult.joint_pain_sensitivity_score}/100</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
