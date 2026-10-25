import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { HelpCircle, BrainCircuit } from 'lucide-react';

export default function ShapExplanationChart({ explainability }) {
  if (!explainability || !explainability.attributions) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
        Feature attribution metrics pending prediction evaluation.
      </div>
    );
  }

  const attributions = explainability.attributions;
  const featureValues = explainability.feature_values || {};

  const data = Object.keys(attributions).map((key) => {
    const val = attributions[key];
    const rawVal = featureValues[key] ?? '';
    let label = key.replace('_', ' ').toUpperCase();
    if (key === 'temperature') label = 'Temperature (°C)';
    if (key === 'humidity') label = 'Humidity (%)';
    if (key === 'pressure') label = 'Pressure (hPa)';
    if (key === 'wind_speed') label = 'Wind Speed (m/s)';
    if (key === 'rainfall') label = 'Rainfall (mm)';
    if (key === 'cloudiness') label = 'Cloud Cover (%)';

    return {
      feature: label,
      attribution: val,
      raw: rawVal,
      isPositive: val >= 0,
    };
  });

  // Sort by absolute impact magnitude
  data.sort((a, b) => Math.abs(b.attribution) - Math.abs(a.attribution));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">Explainable AI (SHAP Feature Attribution)</h3>
            <p className="text-xs text-slate-500">Quantifying feature contribution weights driving rain impact predictions.</p>
          </div>
        </div>
        <span className="badge-dev text-xs">
          Method: {explainability.method === 'shap' ? 'TreeSHAP' : 'Feature Attribution'}
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} />
            <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={120} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-md text-xs">
                      <p className="font-bold text-slate-900">{item.feature}</p>
                      <p className="text-slate-600">Observed Value: <strong className="text-slate-900">{item.raw}</strong></p>
                      <p className="text-slate-600">Attribution Weight: <strong className={item.isPositive ? 'text-emerald-600' : 'text-rose-600'}>{item.attribution}</strong></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#cbd5e1" />
            <Bar dataKey="attribution" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isPositive ? '#0284c7' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-600"></span> Positive Rain Push</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Dry Sky Suppression</span>
        </div>
        <span>Developed by DSMV Labs</span>
      </div>
    </div>
  );
}
