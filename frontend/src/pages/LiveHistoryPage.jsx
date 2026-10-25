import React, { useMemo, useState } from 'react';
import { Download, FileText, RefreshCw, Search, Sparkles } from 'lucide-react';
import api, { errorMessage } from '../api';
import useRemoteData from '../hooks/useRemoteData';
import StatusPill from '../components/StatusPill';
import { exportPredictionPDF, exportToCSV } from '../utils/exportUtils';

export default function LiveHistoryPage() {
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useRemoteData(async () => {
    const res = await api.get('/prediction-history?limit=100');
    return res.data?.items || res.data || [];
  }, []);

  const items = useMemo(
    () => (data || []).filter((item) => item.city.toLowerCase().includes(query.toLowerCase())),
    [data, query]
  );

  const handleExportCSV = () => {
    const exportRows = items.map((i) => ({
      ID: i.id,
      City: i.city,
      Date: new Date(i.created_at).toLocaleString(),
      'Rain Probability (%)': i.rain_probability,
      'Flood Risk': i.flood_risk,
      'Drying Suitability': i.drying_condition,
      'ML Model': i.selected_model || 'best',
    }));
    exportToCSV('SkyIntel_Prediction_History.csv', exportRows);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="badge-dev mb-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            <span>Developed by DSMV Labs</span>
          </div>
          <h1 className="page-title">Prediction Intelligence History</h1>
          <p className="page-subtitle">Every saved weather evaluation run under your account.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={reload} disabled={loading} className="secondary-button py-2 px-3 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!items.length}
            className="primary-button py-2 px-4 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {errorMessage(error)}
        </div>
      )}

      {/* Filter & Table Card */}
      <div className="glass overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search history by city name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input pl-10 text-xs py-2"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {loading ? 'Loading...' : `Displaying ${items.length} evaluation records`}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading prediction history...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Evaluated At</th>
                  <th>Rain Probability</th>
                  <th>Model Used</th>
                  <th>Flood Risk</th>
                  <th>Drying Suitability</th>
                  <th>Export Certificate</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-slate-900">{item.city}</td>
                    <td className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="font-semibold text-slate-900">{item.rain_probability}%</td>
                    <td className="uppercase text-[11px] font-semibold text-sky-700">
                      {item.selected_model || 'best'}
                    </td>
                    <td>
                      <StatusPill value={item.flood_risk} />
                    </td>
                    <td>
                      <StatusPill value={item.drying_condition} />
                    </td>
                    <td>
                      <button
                        onClick={() => exportPredictionPDF(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-50 transition"
                        title="Download PDF Certificate"
                      >
                        <FileText className="h-3 w-3" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}

                {!items.length && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-xs text-slate-400">
                      No evaluation history records match your search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
