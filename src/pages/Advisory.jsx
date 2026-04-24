import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cropApi } from '../api/axios';

const SOIL_TYPES = ['clay', 'sandy', 'loamy', 'silt', 'red', 'black'];

export default function Advisory() {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.location || '');
  const [soilType, setSoilType] = useState(user?.soil_type || '');
  const [advisory, setAdvisory] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await cropApi.get('/api/v1/crops/history');
      setHistory(res.data);
    } catch (e) { /* ignore */ }
  };

  const getAdvisory = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setAdvisory(null);
    try {
      const res = await cropApi.get('/api/v1/crops/advisory', { params: { location, soil_type: soilType } });
      setAdvisory(res.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get advisory');
    } finally { setLoading(false); }
  };

  const scoreColor = (score) => {
    if (score >= 0.9) return 'text-green-400';
    if (score >= 0.8) return 'text-emerald-400';
    if (score >= 0.7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const scoreBar = (score) => (
    <div className="w-full bg-white/5 rounded-full h-2 mt-1">
      <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500" style={{ width: `${score * 100}%` }} />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🌾 Crop Advisory</h1>
        <p className="text-gray-400">Get smart crop recommendations based on weather & soil analysis</p>
      </div>

      {/* Advisory Form */}
      <div className="glass-card p-6">
        <form onSubmit={getAdvisory} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} className="input-field" placeholder="e.g. Mumbai, Delhi, London" required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Soil Type</label>
            <select value={soilType} onChange={e => setSoilType(e.target.value)} className="input-field" required>
              <option value="">Select</option>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</span> : '🔍 Get Advisory'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Advisory Results */}
      {advisory && (
        <div className="space-y-6 animate-slide-up">
          {/* Weather */}
          {advisory.weather && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">🌤️ Weather in {advisory.location}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-sky-400">{advisory.weather.temperature?.toFixed(1)}°C</div>
                  <div className="text-xs text-gray-400 mt-1">Temperature</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-blue-400">{advisory.weather.humidity}%</div>
                  <div className="text-xs text-gray-400 mt-1">Humidity</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-cyan-400">{advisory.weather.wind_speed} m/s</div>
                  <div className="text-xs text-gray-400 mt-1">Wind Speed</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-indigo-400">{advisory.weather.pressure} hPa</div>
                  <div className="text-xs text-gray-400 mt-1">Pressure</div>
                </div>
              </div>
              {advisory.weather.description && <p className="text-sm text-gray-400 mt-3 capitalize">Conditions: {advisory.weather.description}</p>}
            </div>
          )}

          {/* Reasoning */}
          <div className="glass-card p-6 border-l-4 border-primary-500">
            <h3 className="text-sm font-semibold text-primary-300 mb-2">📋 Analysis</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{advisory.reasoning}</p>
          </div>

          {/* Crop Recommendations */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">🌱 Recommended Crops</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {advisory.recommended_crops.map((crop, i) => (
                <div key={i} className="glass-card p-5 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{crop.crop_name}</h3>
                    <span className={`text-lg font-bold ${scoreColor(crop.suitability_score)}`}>
                      {(crop.suitability_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  {scoreBar(crop.suitability_score)}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="badge-green">{crop.season}</span>
                    <span className="badge-blue">{crop.growing_period_days} days</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{crop.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="glass-card p-6">
        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold text-white">📜 Advisory History ({history.length})</h2>
          <span className="text-gray-400 text-xl">{showHistory ? '▲' : '▼'}</span>
        </button>
        {showHistory && (
          <div className="mt-4 space-y-3 animate-slide-down">
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No history yet. Get your first advisory above!</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div><span className="font-medium text-white">{h.location}</span> <span className="badge-green ml-2">{h.soil_type}</span></div>
                    <span className="text-xs text-gray-500">{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>
                  {h.recommended_crops && <div className="flex gap-1.5 mt-2 flex-wrap">{h.recommended_crops.slice(0, 4).map((c, j) => <span key={j} className="badge-blue">{c.crop_name || c}</span>)}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
