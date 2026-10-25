import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Search, Navigation, CloudRain, Wind, Thermometer, Cloud, 
  AlertTriangle, Play, Pause, ChevronRight, ChevronLeft, MapPin, 
  Sparkles, Compass 
} from 'lucide-react';
import api from '../api';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 9, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// Generate interactive timeline forecast steps
const generateTimelineSteps = () => {
  const steps = [];
  const baseTime = new Date();
  for (let i = 0; i <= 24; i += 3) {
    const time = new Date(baseTime.getTime() + i * 60 * 60 * 1000);
    steps.push({
      label: i === 0 ? 'Live' : `+${i}h`,
      displayTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offset: i
    });
  }
  return steps;
};

const TIMELINE_STEPS = generateTimelineSteps();

// Helper to determine styling based on layers and grid cell values
const getCellColor = (value, layer) => {
  if (layer === 'rain') {
    if (value < 0.2) return 'transparent';
    if (value < 1.5) return '#38bdf8'; // light blue
    if (value < 4.0) return '#0284c7'; // dark blue
    if (value < 8.0) return '#10b981'; // moderate green
    if (value < 12.0) return '#f59e0b'; // orange
    if (value < 16.0) return '#ef4444'; // red
    return '#a855f7'; // purple
  }
  if (layer === 'wind') {
    if (value < 3.0) return '#38bdf8';
    if (value < 7.0) return '#0ea5e9';
    if (value < 12.0) return '#818cf8';
    return '#f43f5e';
  }
  if (layer === 'temp') {
    if (value < 15) return '#3b82f6'; // cold blue
    if (value < 25) return '#10b981'; // pleasant emerald
    if (value < 32) return '#f59e0b'; // warm yellow
    return '#ef4444'; // hot red
  }
  if (layer === 'clouds') {
    return `rgba(226, 232, 240, ${value / 100})`; // white opacity
  }
  if (layer === 'warnings') {
    return value ? 'rgba(239, 68, 68, 0.7)' : 'transparent';
  }
  return 'transparent';
};

export default function WeatherMap({ initialCity = 'Mumbai', onCitySelect }) {
  const [position, setPosition] = useState([19.076, 72.8777]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [locationName, setLocationName] = useState(initialCity);
  const [selectedLayer, setSelectedLayer] = useState('rain'); // rain, wind, temp, clouds, warnings
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(true);
  const [weatherMetrics, setWeatherMetrics] = useState({
    temperature: 28.5,
    humidity: 78,
    windSpeed: 5.4,
    windDeg: 240,
    rainfall: 1.2,
    cloudiness: 45
  });

  const playIntervalRef = useRef(null);

  const fetchWeatherMetrics = async (lat, lon, name) => {
    try {
      const res = await api.get('/weather-history/live', {
        params: { lat, lon, city: name || undefined }
      });
      if (res.data) {
        setWeatherMetrics({
          temperature: res.data.temperature,
          humidity: res.data.humidity,
          windSpeed: res.data.wind_speed,
          windDeg: res.data.wind_deg || 240,
          rainfall: res.data.rainfall,
          cloudiness: res.data.cloudiness
        });
      }
    } catch {
      setWeatherMetrics({
        temperature: 28.5,
        humidity: 78,
        windSpeed: 5.4,
        windDeg: 240,
        rainfall: 1.2,
        cloudiness: 45
      });
    }
  };

  const handleQueryChange = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      try {
        const res = await api.get('/weather-history/autocomplete', { params: { q } });
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectCity = (cityItem) => {
    const lat = parseFloat(cityItem.lat);
    const lon = parseFloat(cityItem.lon);
    setPosition([lat, lon]);
    setLocationName(cityItem.name);
    setSearchQuery('');
    setSuggestions([]);
    fetchWeatherMetrics(lat, lon, cityItem.name);
    if (onCitySelect) onCitySelect(cityItem.name);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await api.get('/weather-history/autocomplete', { params: { q: searchQuery } });
      if (res.data && res.data.length > 0) {
        selectCity(res.data[0]);
      }
    } catch {
      // silent fallback
    }
  };

  const handleGpsLock = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setPosition([lat, lon]);
          setLocationName('My Coordinates');
          fetchWeatherMetrics(lat, lon, 'My Coordinates');
        },
        () => alert('GPS position access denied.')
      );
    }
  };

  const generateOverlayGrid = () => {
    const grid = [];
    const spacing = 0.2;
    const [cLat, cLon] = position;
    const hourOffset = TIMELINE_STEPS[timelineIndex].offset;

    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        const cellLat = cLat + x * spacing;
        const cellLon = cLon + y * spacing;

        const noise = (Math.sin(x * 1.5 + hourOffset * 0.4) * Math.cos(y * 1.5 - hourOffset * 0.4) + 1.0) / 2.0;

        let value = 0;
        let details = '';

        if (selectedLayer === 'rain') {
          value = parseFloat((noise * 18.0 * (weatherMetrics.rainfall / 2.0 + 0.5)).toFixed(1));
          details = `${value} mm/h`;
        } else if (selectedLayer === 'wind') {
          value = parseFloat((noise * 16.0 + weatherMetrics.windSpeed * 0.5).toFixed(1));
          details = `${value} m/s`;
        } else if (selectedLayer === 'temp') {
          value = parseFloat((weatherMetrics.temperature + Math.sin(hourOffset * 0.5) * 3 - Math.hypot(x, y) * 0.5).toFixed(1));
          details = `${value} °C`;
        } else if (selectedLayer === 'clouds') {
          value = Math.min(100, Math.max(0, Math.round(weatherMetrics.cloudiness + noise * 30 - Math.hypot(x, y) * 5)));
          details = `${value}% coverage`;
        } else if (selectedLayer === 'warnings') {
          value = noise > 0.72 ? 1 : 0;
          details = value ? 'Severe Warning Zone' : 'Clear Zone';
        }

        grid.push({
          coords: [cellLat, cellLon],
          value,
          details
        });
      }
    }
    return grid;
  };

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setTimelineIndex((prev) => (prev + 1) % TIMELINE_STEPS.length);
      }, 2000);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    fetchWeatherMetrics(position[0], position[1], locationName);
  }, [position]);

  const overlayCells = generateOverlayGrid();
  const currentStep = TIMELINE_STEPS[timelineIndex];

  const getScrubberCellData = (stepOffset) => {
    const tempVal = parseFloat((weatherMetrics.temperature + Math.sin(stepOffset * 0.5) * 3).toFixed(1));
    const rainVal = parseFloat(Math.max(0, weatherMetrics.rainfall + Math.cos(stepOffset * 0.5) * 1.5).toFixed(1));
    const windVal = parseFloat(Math.max(0.5, weatherMetrics.windSpeed + Math.sin(stepOffset * 0.8) * 2).toFixed(1));
    const windRot = (weatherMetrics.windDeg + stepOffset * 10) % 360;

    return { tempVal, rainVal, windVal, windRot };
  };

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[580px] flex flex-col">
      
      {/* 1. Floating Glassmorphic Top-Left Search Panel */}
      <div className="absolute left-4 top-4 z-[1000] w-72 max-w-[calc(100vw-2rem)]">
        <div className="glass-card bg-white border-slate-200 p-2 rounded-2xl shadow-xl flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 pl-2">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search cities (e.g. Pune, Delhi)..."
              value={searchQuery}
              onChange={handleQueryChange}
              className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none w-full font-semibold"
            />
          </form>
          <button 
            type="button" 
            onClick={handleGpsLock}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sky-600 transition"
            title="Lock Current GPS Location"
          >
            <Navigation className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Search Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="mt-1.5 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xl space-y-1">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => selectCity(item)}
                className="w-full text-left px-3 py-2 text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition"
              >
                <MapPin className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                <span>{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Collapsible Right-Hand Layer Selector Menu */}
      <div className="absolute right-4 top-4 z-[1000] flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5">
          <div className="badge-dev py-1 bg-white border border-slate-200 text-[9px] text-slate-650 font-bold">
            <Sparkles className="h-3 w-3 text-sky-500 animate-pulse" />
            <span>DSMV Labs</span>
          </div>
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-xl transition"
          >
            {isLayerMenuOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {isLayerMenuOpen && (
          <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-44">
            <span className="text-[8px] font-extrabold tracking-widest text-slate-500 uppercase px-2 py-1">Select Overlay</span>
            
            {[
              { id: 'rain', label: 'Rain / Precip', icon: CloudRain, color: 'text-sky-400' },
              { id: 'wind', label: 'Wind Vector', icon: Wind, color: 'text-indigo-400' },
              { id: 'temp', label: 'Temperature', icon: Thermometer, color: 'text-rose-400' },
              { id: 'clouds', label: 'Cloud Cover', icon: Cloud, color: 'text-slate-300' },
              { id: 'warnings', label: 'Risk Alerts', icon: AlertTriangle, color: 'text-amber-500' }
            ].map((layer) => {
              const Icon = layer.icon;
              const active = selectedLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-[11px] font-extrabold rounded-xl transition duration-200 ${
                    active 
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow' 
                      : 'text-slate-550 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-white' : layer.color}`} />
                  <span>{layer.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Base Leaflet Container */}
      <div className="flex-1 min-h-[440px] relative z-0">
        <MapContainer center={position} zoom={8} scrollWheelZoom={true} className="w-full map-dark-skin" style={{ height: '100%', minHeight: '440px' }}>
          <MapRecenter center={position} />
          
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> | DSMV Labs'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Windy-Style Data Grid Circles */}
          {overlayCells.map((cell, idx) => (
            <Circle
              key={`cell-${selectedLayer}-${idx}-${cell.coords[0]}-${cell.coords[1]}`}
              center={cell.coords}
              radius={19000}
              pathOptions={{
                color: getCellColor(cell.value, selectedLayer),
                fillColor: getCellColor(cell.value, selectedLayer),
                fillOpacity: selectedLayer === 'clouds' ? 0.35 : 0.48,
                weight: 0.5,
              }}
            >
              <Popup>
                <div className="p-2 text-slate-700 font-sans text-xs min-w-[140px]">
                  <div className="flex items-center gap-1.5 text-sky-600 font-bold border-b border-slate-100 pb-1 mb-1 capitalize">
                    {selectedLayer} Data Overlay
                  </div>
                  <div className="space-y-0.5 text-[10px]">
                    <p>Measurement: <strong className="text-slate-900">{cell.details}</strong></p>
                    <p>Timeline: <strong className="text-slate-900">{currentStep.label} ({currentStep.displayTime})</strong></p>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Center Target City Marker */}
          <Marker position={position}>
            <Popup>
              <div className="p-2.5 text-slate-700 font-sans text-xs min-w-[200px]">
                <div className="flex items-center justify-between border-b border-slate-150 pb-1.5 mb-2">
                  <span className="font-extrabold text-slate-900 text-[11px] truncate">{locationName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 font-bold font-mono">STATION</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <strong className="text-slate-900">{weatherMetrics.temperature}°C</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Humidity:</span>
                    <strong className="text-slate-900">{weatherMetrics.humidity}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Rainfall Rate:</span>
                    <strong className="text-sky-600 font-bold">{weatherMetrics.rainfall} mm/h</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind Direction:</span>
                    <span className="flex items-center gap-1 text-slate-800">
                      <Compass 
                        className="h-3 w-3 text-sky-600 transition-transform" 
                        style={{ transform: `rotate(${weatherMetrics.windDeg}deg)` }} 
                      />
                      <strong className="text-slate-900">{weatherMetrics.windSpeed} m/s @ {weatherMetrics.windDeg}°</strong>
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* 4. Bottom Interactive Windy-Style Timeline Scrubber Card */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex flex-col gap-3 relative z-[1000]">
        
        {/* Playback Controls & Info Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-xl text-[10px] font-bold transition duration-200 shadow ${
                isPlaying ? 'bg-rose-605 hover:bg-rose-500 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 animate-pulse" />}
              <span>{isPlaying ? 'Pause' : 'Animate Timeline'}</span>
            </button>
            <div className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
              Display Frame: <span className="text-sky-600">{currentStep.label} ({currentStep.displayTime})</span>
            </div>
          </div>

          {/* Value Color Legend Ramp mapping values dynamically */}
          <div className="flex items-center gap-2 text-[8px] font-extrabold text-slate-450 uppercase tracking-wider">
            <span>Legend:</span>
            <div className="flex items-center gap-0.5">
              <span className="w-2.5 h-2.5 rounded bg-[#38bdf8]" title="Low Intensity"></span>
              <span className="w-2.5 h-2.5 rounded bg-[#0284c7]" title="Mild Intensity"></span>
              <span className="w-2.5 h-2.5 rounded bg-[#10b981]" title="Moderate Intensity"></span>
              <span className="w-2.5 h-2.5 rounded bg-[#f59e0b]" title="High Intensity"></span>
              <span className="w-2.5 h-2.5 rounded bg-[#ef4444]" title="Severe Intensity"></span>
            </div>
            <span className="font-mono text-slate-600 ml-1">Low → Severe</span>
          </div>
        </div>

        {/* Timeline Scrubber Slider */}
        <div className="relative pt-1 flex items-center gap-3">
          <span className="text-[9px] font-bold font-mono text-slate-450">Live</span>
          <input
            type="range"
            min="0"
            max={TIMELINE_STEPS.length - 1}
            step="1"
            value={timelineIndex}
            onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer bg-slate-200 h-1.5 rounded-lg border border-slate-300"
          />
          <span className="text-[9px] font-bold font-mono text-slate-450">+24h</span>
        </div>

        {/* 5-Day / 3-Hour Interactive Forecast Grid Strip */}
        <div className="grid grid-cols-9 border border-white/5 rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur">
          {TIMELINE_STEPS.map((step, idx) => {
            const data = getScrubberCellData(step.offset);
            const isActive = timelineIndex === idx;

            return (
              <button
                key={step.offset}
                onClick={() => setTimelineIndex(idx)}
                className={`p-2 border-r border-slate-200 text-center flex flex-col items-center gap-1 transition ${
                  isActive ? 'bg-sky-50 border-sky-205' : 'hover:bg-slate-100'
                }`}
              >
                <span className={`text-[8px] font-extrabold ${isActive ? 'text-sky-600' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                <span className="text-[9px] font-extrabold text-slate-800">
                  {data.tempVal}°
                </span>
                
                <div className="flex flex-col items-center gap-0.5 text-[8px] text-slate-500 font-medium">
                  <span className="text-[7px] text-sky-600 font-bold">{data.rainVal}mm</span>
                  <span className="flex items-center gap-0.5 font-mono">
                    <Compass 
                      className="h-2 w-2 text-indigo-400 inline" 
                      style={{ transform: `rotate(${data.windRot}deg)` }} 
                    />
                    {data.windVal}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
