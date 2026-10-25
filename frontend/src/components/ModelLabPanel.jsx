import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, RefreshCw, Upload, AlertCircle, CheckCircle, RotateCcw, LineChart as ChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { errorMessage } from '../api';

export default function ModelLabPanel() {
  const [activeTab, setActiveTab] = useState('benchmarks');
  const [models, setModels] = useState([]);
  const [rocCurve, setRocCurve] = useState([]);
  const [prCurve, setPrCurve] = useState([]);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  
  const [epochs, setEpochs] = useState(10);
  const [lr, setLr] = useState(0.01);
  const [training, setTraining] = useState(false);
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLabData = async () => {
    setErrorMsg('');
    try {
      const res = await api.get('/admin/models/compare');
      setModels(res.data.active_models || []);
      setRocCurve(res.data.roc_curve || []);
      setPrCurve(res.data.pr_curve || []);
      setConfusionMatrix(res.data.confusion_matrix || null);
    } catch (err) {
      setErrorMsg(errorMessage(err));
    }
  };

  useEffect(() => {
    fetchLabData();
  }, []);

  const handleRetrain = async (e) => {
    e.preventDefault();
    setTraining(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await api.post('/admin/models/retrain', null, {
        params: { epochs, learning_rate: lr }
      });
      setSuccessMsg(res.data.message);
      fetchLabData();
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setTraining(false);
    }
  };

  const handleRollback = async (versionName) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/admin/models/rollback', null, {
        params: { version: versionName }
      });
      setSuccessMsg(res.data.message);
      fetchLabData();
    } catch (err) {
      setErrorMsg(errorMessage(err));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/admin/models/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg(res.data.message);
      setFile(null);
      fetchLabData();
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-3.5">
        <div>
          <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
            🧪 AI Model Laboratory &amp; Ensembles
          </h3>
          <p className="text-xs text-slate-400">Evaluate confusion matrix grids, retrain estimators, and rollback models.</p>
        </div>
        <div className="flex items-center gap-1.5">
          {['benchmarks', 'retrain', 'upload'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                activeTab === tab 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tab === 'upload' ? 'Upload Data' : tab}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 font-semibold">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: BENCHMARKS */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Version List */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Model Logs</h4>
              <div className="space-y-2 text-xs">
                {models.map((model, idx) => (
                  <div key={idx} className={`p-4.5 rounded-2xl border flex flex-col justify-between gap-3 shadow-inner ${
                    model.is_active ? 'bg-sky-500/5 border-sky-500/20' : 'bg-slate-900/40 border-white/5'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-white block font-bold">{model.version}</strong>
                        <span className="text-[9px] text-slate-500 block mt-0.5">{model.timestamp}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        model.is_active ? 'bg-sky-600 text-white' : 'bg-white/5 text-slate-400'
                      }`}>
                        {model.is_active ? 'Active' : 'Archived'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] text-center border-t border-white/5 pt-2 font-semibold text-slate-400 uppercase">
                      <div>Acc: <strong className="text-white">{(model.accuracy * 100).toFixed(1)}%</strong></div>
                      <div>F1: <strong className="text-white">{(model.f1_score * 100).toFixed(1)}%</strong></div>
                      <div>ROC: <strong className="text-white">{model.roc_auc.toFixed(3)}</strong></div>
                    </div>

                    {!model.is_active && (
                      <button
                        onClick={() => handleRollback(model.version)}
                        className="secondary-button text-[10px] py-1.5 justify-center gap-1.5 mt-1 bg-white/5 border-white/5 hover:bg-white/10"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-sky-450" /> Deploy Version
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Curves */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest">Precision Attributions</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900/40 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 block mb-1.5 text-center uppercase tracking-wider">ROC Curve (TPR / FPR)</span>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rocCurve}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                        <XAxis dataKey="fpr" stroke="#94a3b8" fontSize={9} />
                        <YAxis dataKey="tpr" stroke="#94a3b8" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Line type="monotone" dataKey="tpr" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 block mb-1.5 text-center uppercase tracking-wider">PR Curve (Prec / Rec)</span>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prCurve}>
                        <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                        <XAxis dataKey="recall" stroke="#94a3b8" fontSize={9} />
                        <YAxis dataKey="precision" stroke="#94a3b8" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Line type="monotone" dataKey="precision" stroke="#a855f7" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Confusion Matrix */}
              {confusionMatrix && (
                <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest">Confusion Matrix Grid</span>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-center text-xs">
                    <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">True Neg (TN)</span>
                      <strong className="text-white text-sm">{confusionMatrix.true_negative}</strong>
                    </div>
                    <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">False Pos (FP)</span>
                      <strong className="text-rose-450 text-sm">{confusionMatrix.false_positive}</strong>
                    </div>
                    <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">False Neg (FN)</span>
                      <strong className="text-rose-450 text-sm">{confusionMatrix.false_negative}</strong>
                    </div>
                    <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">True Pos (TP)</span>
                      <strong className="text-white text-sm">{confusionMatrix.true_positive}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RETRAIN */}
      {activeTab === 'retrain' && (
        <div className="max-w-md mx-auto glass p-6 space-y-4">
          <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-indigo-400" /> Hyperparameter Vectors
          </h4>
          <form onSubmit={handleRetrain} className="space-y-4 text-xs">
            <div>
              <label className="form-label mb-1.5 block">Epochs / Estimators</label>
              <input
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                min="1"
                max="50"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label mb-1.5 block">Learning rate factor</label>
              <input
                type="number"
                step="0.001"
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                min="0.0001"
                max="0.5"
                className="form-input"
              />
            </div>
            
            <button
              type="submit"
              disabled={training}
              className="primary-button w-full py-3 text-xs font-bold"
            >
              {training ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {training ? 'Running training calculations...' : 'Execute Laboratory Training'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: UPLOAD DATASET */}
      {activeTab === 'upload' && (
        <div className="max-w-md mx-auto glass p-6 space-y-4">
          <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
            <Upload className="h-4.5 w-4.5 text-indigo-400" /> Ingest CSV Telemetry Vectors
          </h4>
          <p className="text-xs text-slate-400">Load a custom training CSV weather corpus containing pressure, humidity, wind speed, and temperature columns to retrain core model variables.</p>
          
          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div className="p-5 border-2 border-dashed border-white/10 rounded-2xl text-center cursor-pointer hover:bg-white/5 transition duration-300">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-telemetry-upload"
              />
              <label htmlFor="csv-telemetry-upload" className="cursor-pointer space-y-2 block">
                <Upload className="h-8 w-8 text-slate-500 mx-auto" />
                <span className="block text-xs font-bold text-slate-300">
                  {file ? file.name : 'Choose CSV file'}
                </span>
                <span className="block text-[9px] text-slate-500">Max size 25MB</span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={uploading || !file}
              className="primary-button w-full py-3 text-xs font-bold"
            >
              {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Import Telemetry vectors'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
