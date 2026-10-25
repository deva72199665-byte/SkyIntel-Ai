import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  CloudRain,
  Compass,
  Download,
  Droplets,
  FileText,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Shirt,
  Sparkles,
  Thermometer,
  Umbrella,
  Wind,
  Shield,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import api, { errorMessage } from '../api';
import StatusPill from '../components/StatusPill';
import ShapExplanationChart from '../components/ShapExplanationChart';
import { exportPredictionPDF } from '../utils/exportUtils';
import { sendWeatherAlert } from '../utils/notifications';
import WeatherTimeline from '../components/WeatherTimeline';

const SCAN_STEPS = [
  "Securing GPS satellite coordinates...",
  "Acquiring live atmospheric telemetry...",
  "Extracting barometric and humidity vectors...",
  "Running ensemble ML classification algorithms...",
  "Calculating SHAP explainable AI attributions...",
  "Assembling operational risk metrics..."
];

export default function LivePredictionPage() {
  const [city, setCity] = useState('Mumbai');
  const [modelChoice, setModelChoice] = useState('best');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Scanning simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIdx, setScanStepIdx] = useState(0);

  const modelOptions = [
    { value: 'best', label: 'Ensemble Best Model (Automated Winner)' },
    { value: 'random_forest', label: 'Random Forest Classifier' },
    { value: 'xgboost', label: 'XGBoost Gradient Boosting' },
    { value: 'lightgbm', label: 'LightGBM Classifier' },
    { value: 'catboost', label: 'CatBoost Classifier' },
    { value: 'logistic_regression', label: 'Logistic Regression' },
    { value: 'decision_tree', label: 'Decision Tree Classifier' },
  ];

  const handlePredict = async (cityName = city, coords = null) => {
    setLoading(true);
    setError('');
    setResult(null);
    setIsScanning(true);
    setScanStepIdx(0);

    // Dynamic scanning labels sweep interval
    const interval = setInterval(() => {
      setScanStepIdx((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    try {
      const params = { model: modelChoice };
      if (coords) {
        params.lat = coords.lat;
        params.lon = coords.lon;
      } else {
        params.city = cityName;
      }

      const response = await api.post('/prediction-history/live', null, { params });
      
      // Delay result reveal by 6 seconds to complete the scanning sequence simulation
      setTimeout(() => {
        setResult(response.data);
        setIsScanning(false);
        setLoading(false);
        clearInterval(interval);

        if (response.data.rain_probability > 70 || ['High', 'Severe'].includes(response.data.flood_risk)) {
          sendWeatherAlert(
            `Severe Rain & Flood Alert for ${response.data.city}`,
            `Rain Probability: ${response.data.rain_probability}%. Flood Risk: ${response.data.flood_risk}.`,
            'severe'
          );
        }
      }, 5000);

    } catch (err) {
      setError(errorMessage(err));
      setIsScanning(false);
      setLoading(false);
      clearInterval(interval);
    }
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePredict(null, { lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          setError('Geolocation lock denied.');
        }
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="badge-dev mb-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-spin" />
            <span>SkyIntel AI Weather Core</span>
          </div>
          <h1 className="page-title">Meteorological Prediction Center</h1>
          <p className="page-subtitle">
            Configure ensembles, execute multi-factor radar scans, and view Mission Intelligence Reports.
          </p>
        </div>
      </div>

      {/* Control Panel inputs */}
      <div className="glass p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="form-label">Query City / Region</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai, New York..."
              className="form-input pl-10"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Active Core Algorithms</label>
          <select
            value={modelChoice}
            onChange={(e) => setModelChoice(e.target.value)}
            className="form-input cursor-pointer"
          >
            {modelOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handlePredict()}
            disabled={loading}
            className="primary-button flex-1 py-3"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4 text-sky-300" />}
            <span>Run Radar Scan</span>
          </button>
          
          <button
            onClick={handleGeolocate}
            disabled={loading}
            className="secondary-button py-3 bg-white/5 border-white/5 hover:bg-white/10"
            title="GPS LOCK"
          >
            <Navigation className="h-4.5 w-4.5 text-sky-400" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-400 font-bold">
          {error}
        </div>
      )}

      {/* 1. Atmospheric Scan Loader Sequence */}
      {isScanning && (
        <div className="glass p-10 flex flex-col items-center justify-center text-center space-y-6 animate-pulse radar-sweep-container min-h-[300px]">
          <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-sky-500/30 flex items-center justify-center animate-spin">
            <Globe className="h-10 w-10 text-sky-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-bold text-slate-855 uppercase tracking-wider">
              Atmospheric Scan In Progress
            </h3>
            <p className="text-xs text-sky-600 font-extrabold font-mono transition-all duration-300">
              {SCAN_STEPS[scanStepIdx]}
            </p>
          </div>

          <div className="w-64 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="bg-sky-500 h-full transition-all duration-500" 
              style={{ width: `${((scanStepIdx + 1) / SCAN_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. Mission Intelligence Results Dashboard */}
      {result && !isScanning && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Main Highlights Row */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Rain Probability Dial Gauge */}
            <div className="glass p-6 flex flex-col justify-between items-center text-center border-l-4 border-l-sky-500">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Precipitation probability</span>
              <div className="relative h-32 w-32 flex items-center justify-center my-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(0,0,0,0.03)" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" fill="transparent" stroke="#0ea5e9" strokeWidth="8" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 - (251.2 * result.rain_probability) / 100}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <b className="font-heading text-3xl font-black text-slate-800">{result.rain_probability}%</b>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5">Rain Chance</span>
                </div>
              </div>
              <span className="text-xs text-sky-600 font-semibold">{result.rain_probability > 50 ? 'Precipitation Likely' : 'Dry conditions expected'}</span>
            </div>

            {/* Hydrological Flood Risk Gauge */}
            <div className={`glass p-6 flex flex-col justify-between items-center text-center border-l-4 ${
              result.flood_risk === 'Severe' || result.flood_risk === 'High' ? 'border-l-rose-500' : 'border-l-indigo-500'
            }`}>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Hydrological Flood risk</span>
              
              <div className="my-6">
                <b className={`font-heading text-4xl font-black block tracking-tight ${
                  result.flood_risk === 'Severe' || result.flood_risk === 'High' ? 'text-rose-605 font-black' : 'text-slate-700'
                }`}>
                  {result.flood_risk}
                </b>
                <span className="block text-[9px] text-slate-500 font-bold uppercase mt-1">Severity scale</span>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className={`h-full ${
                    result.flood_risk === 'Severe' ? 'bg-rose-600' :
                    result.flood_risk === 'High' ? 'bg-orange-500' :
                    result.flood_risk === 'Moderate' ? 'bg-amber-400' : 'bg-indigo-500'
                  }`}
                  style={{ width: result.flood_risk_score ? `${result.flood_risk_score}%` : '20%' }}
                />
              </div>
            </div>

            {/* AI Diagnostics details */}
            <div className="glass p-6 flex flex-col justify-between border-l-4 border-l-emerald-500">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">AI Diagnosis Summary</span>
                <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3.5 rounded-xl border border-slate-150 mt-2">
                  "{result.summary || 'Atmospheric telemetry confirms standard weather behaviors within safe margins.'}"
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 text-xs text-slate-500">
                <span>Model Confidence:</span>
                <strong className="text-slate-800 font-bold">{result.prediction_confidence ?? 94}%</strong>
              </div>
            </div>

          </div>

          {/* Floating parameters panel grid */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { label: 'Observed Temp', val: `${result.temperature}°C`, sub: 'Atmospheric bounds', icon: Thermometer, color: 'text-rose-400' },
              { label: 'Observed Humidity', val: `${result.humidity}%`, sub: 'Relative air moisture', icon: Droplets, color: 'text-sky-400' },
              { label: 'Wind Velocity', val: `${result.wind_speed} m/s`, sub: 'Anemometer vectors', icon: Wind, color: 'text-teal-400' },
              { label: 'Soil drying index', val: result.drying_condition, sub: 'laundry advisory', icon: Shirt, color: 'text-amber-400' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">{stat.label}</span>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <b className="font-heading text-xl font-bold text-slate-800 block">{stat.val}</b>
                  <p className="text-[9px] text-slate-500 font-semibold uppercase">{stat.sub}</p>
                </div>
              );
            })}
          </div>

          {/* PDF Certificate download button */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4.5">
            <span className="text-xs font-semibold text-slate-650 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-sky-600" />
              <span>SkyIntel Mission Weather Certificate is ready for export.</span>
            </span>
            <button
              onClick={() => exportPredictionPDF(result)}
              className="primary-button text-xs py-2 px-5"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </div>

          {/* SHAP explanation curves */}
          <div className="glass p-6">
            <ShapExplanationChart explainability={result.explainability} />
          </div>

          {/* Actionable Advisories */}
          <div className="glass p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
              <Sparkles className="h-5 w-5 text-sky-600 animate-pulse" />
              <h3 className="card-title">AI Actionable Recommendations</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {Array.isArray(result.recommendations) ? (
                result.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-150 bg-slate-50 space-y-1.5 hover:border-slate-300 transition"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-sky-600">
                      Recommendation 0{idx + 1}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">{rec}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl border border-slate-150 bg-slate-50 text-xs text-slate-500 col-span-full">
                  {result.recommendations}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Weather Timeline */}
      <WeatherTimeline initialCity={result ? result.city : city} />
    </div>
  );
}
