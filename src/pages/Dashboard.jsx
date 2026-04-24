import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cropApi, marketApi, userApi } from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'];

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', location: user?.location || '',
    soil_type: user?.soil_type || '', farm_size_acres: user?.farm_size_acres || '',
  });
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [h, l, o] = await Promise.allSettled([
      cropApi.get('/api/v1/crops/history'),
      marketApi.get('/api/v1/market/listings'),
      marketApi.get('/api/v1/market/orders'),
    ]);
    if (h.status === 'fulfilled') setHistory(h.value.data);
    if (l.status === 'fulfilled') setListings(l.value.data);
    if (o.status === 'fulfilled') setOrders(o.value.data);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await userApi.put('/api/v1/users/profile', {
        ...profileForm,
        farm_size_acres: profileForm.farm_size_acres ? parseFloat(profileForm.farm_size_acres) : null,
      });
      await refreshProfile();
      setEditing(false);
      setProfileMsg('Profile updated!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch { setProfileMsg('Update failed'); }
  };

  const freq = {};
  history.forEach(h => (h.recommended_crops || []).forEach(c => {
    const n = c.crop_name || c; freq[n] = (freq[n] || 0) + 1;
  }));
  const barData = Object.entries(freq).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  const pieData = [{ name: 'Listings', value: listings.length || 1 }, { name: 'Orders', value: orders.length || 1 }, { name: 'Advisories', value: history.length || 1 }];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-card p-8 bg-gradient-to-br from-primary-900/30 to-primary-800/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome, <span className="gradient-text">{user?.name || 'Farmer'}</span> 👋</h1>
            <p className="text-gray-400">{user?.location && `📍 ${user.location}`}{user?.soil_type && ` • 🌍 ${user.soil_type} soil`}{user?.farm_size_acres && ` • 🌿 ${user.farm_size_acres} acres`}</p>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">{editing ? 'Cancel' : '✏️ Edit Profile'}</button>
        </div>
        {editing && (
          <form onSubmit={handleProfileUpdate} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-down">
            <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="input-field" placeholder="Name" />
            <input value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} className="input-field" placeholder="Location" />
            <select value={profileForm.soil_type} onChange={e => setProfileForm({...profileForm, soil_type: e.target.value})} className="input-field">
              <option value="">Soil type</option>
              {['clay','sandy','loamy','silt','red','black'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <input type="number" step="0.1" value={profileForm.farm_size_acres} onChange={e => setProfileForm({...profileForm, farm_size_acres: e.target.value})} className="input-field" placeholder="Farm acres" />
            <button type="submit" className="btn-primary sm:col-span-2">Save</button>
          </form>
        )}
        {profileMsg && <p className="mt-3 text-sm text-primary-300">{profileMsg}</p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '🌾', val: history.length, label: 'Advisories' },
          { icon: '🏪', val: listings.length, label: 'Listings' },
          { icon: '📦', val: orders.length, label: 'Orders' },
          { icon: '🌍', val: user?.farm_size_acres || '—', label: 'Farm Acres' },
        ].map((s, i) => (
          <div key={i} className="stat-card"><div className="text-3xl mb-2">{s.icon}</div><div className="text-2xl font-bold text-white">{s.val}</div><div className="text-sm text-gray-400">{s.label}</div></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top Recommended Crops</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} /><YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f3f4f6' }} /><Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 text-center"><div><p className="text-4xl mb-2">📊</p><p>No data yet</p><Link to="/advisory" className="text-primary-400 text-sm">Get Advisory →</Link></div></div>
          )}
        </div>
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Activity Overview</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f3f4f6' }} /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/advisory" className="flex items-center gap-3 p-4 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 transition-all group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🌾</span>
            <div><div className="font-medium text-white">Get Advisory</div><div className="text-xs text-gray-400">Smart crop recommendations</div></div>
          </Link>
          <Link to="/marketplace" className="flex items-center gap-3 p-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 transition-all group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🏪</span>
            <div><div className="font-medium text-white">Marketplace</div><div className="text-xs text-gray-400">Buy & sell produce</div></div>
          </Link>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-2xl">👤</span>
            <div><div className="font-medium text-white">{user?.role || 'Farmer'}</div><div className="text-xs text-gray-400">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'today'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
