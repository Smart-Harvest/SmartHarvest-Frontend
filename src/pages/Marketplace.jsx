import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketApi } from '../api/axios';

export default function Marketplace() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('browse');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', description: '', crop_type: '', quantity_kg: '', price_per_kg: '', location: '' });
  const [orderQty, setOrderQty] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [l, o] = await Promise.allSettled([
      marketApi.get('/api/v1/market/listings'),
      marketApi.get('/api/v1/market/orders'),
    ]);
    if (l.status === 'fulfilled') setListings(l.value.data);
    if (o.status === 'fulfilled') setOrders(o.value.data);
    setLoading(false);
  };

  const createListing = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      await marketApi.post('/api/v1/market/listings', {
        ...form, quantity_kg: parseFloat(form.quantity_kg), price_per_kg: parseFloat(form.price_per_kg),
      });
      setSuccess('Listing created!');
      setForm({ title: '', description: '', crop_type: '', quantity_kg: '', price_per_kg: '', location: '' });
      setShowCreate(false);
      fetchAll();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create listing'); }
  };

  const placeOrder = async (listingId) => {
    const qty = parseFloat(orderQty[listingId]);
    if (!qty || qty <= 0) { setError('Enter a valid quantity'); return; }
    setError(''); setSuccess('');
    try {
      await marketApi.post('/api/v1/market/orders', { listing_id: listingId, quantity_kg: qty });
      setSuccess('Order placed successfully!');
      setOrderQty({ ...orderQty, [listingId]: '' });
      fetchAll();
    } catch (err) { setError(err.response?.data?.detail || 'Order failed'); }
  };

  const deleteListing = async (id) => {
    try {
      await marketApi.delete(`/api/v1/market/listings/${id}`);
      setSuccess('Listing removed');
      fetchAll();
    } catch (err) { setError(err.response?.data?.detail || 'Delete failed'); }
  };

  const clearMessages = () => { setTimeout(() => { setError(''); setSuccess(''); }, 4000); };
  useEffect(() => { if (error || success) clearMessages(); }, [error, success]);

  const myListings = listings.filter(l => l.seller_id === user?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">🏪 Marketplace</h1>
          <p className="text-gray-400">Buy and sell fresh produce directly</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          {showCreate ? '✕ Close' : '+ New Listing'}
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm animate-slide-down">{error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-xl text-sm animate-slide-down">{success}</div>}

      {/* Create Listing Form */}
      {showCreate && (
        <div className="glass-card p-6 animate-slide-down">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Listing</h2>
          <form onSubmit={createListing} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="Listing title *" required />
            <input value={form.crop_type} onChange={e => setForm({...form, crop_type: e.target.value})} className="input-field" placeholder="Crop type (e.g. Wheat) *" required />
            <input type="number" step="0.1" value={form.quantity_kg} onChange={e => setForm({...form, quantity_kg: e.target.value})} className="input-field" placeholder="Quantity (kg) *" required />
            <input type="number" step="0.01" value={form.price_per_kg} onChange={e => setForm({...form, price_per_kg: e.target.value})} className="input-field" placeholder="Price per kg (₹) *" required />
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input-field" placeholder="Location" />
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" placeholder="Description" />
            <button type="submit" className="btn-primary sm:col-span-2">Publish Listing</button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {[
          { key: 'browse', label: `Browse (${listings.length})`, icon: '🛒' },
          { key: 'my', label: `My Listings (${myListings.length})`, icon: '📋' },
          { key: 'orders', label: `Orders (${orders.length})`, icon: '📦' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-medium transition-all
              ${tab === t.key ? 'bg-white/10 text-white border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-200'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" /><p>Loading...</p></div>
      ) : (
        <>
          {/* Browse Tab */}
          {tab === 'browse' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.length === 0 ? (
                <div className="col-span-full text-center py-16 text-gray-500"><p className="text-4xl mb-2">🏪</p><p>No listings yet. Be the first to sell!</p></div>
              ) : listings.map(l => (
                <div key={l.id} className="glass-card p-5 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors">{l.title}</h3>
                    <span className="badge-green">{l.crop_type}</span>
                  </div>
                  {l.description && <p className="text-sm text-gray-400 mb-3">{l.description}</p>}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
                    <span>📦 {l.quantity_kg} kg</span>
                    <span className="font-semibold text-primary-400">₹{l.price_per_kg}/kg</span>
                    {l.location && <span>📍 {l.location}</span>}
                  </div>
                  {l.seller_id !== user?.id && (
                    <div className="flex gap-2">
                      <input type="number" step="0.1" min="0.1" max={l.quantity_kg} placeholder="Qty (kg)"
                        value={orderQty[l.id] || ''} onChange={e => setOrderQty({...orderQty, [l.id]: e.target.value})}
                        className="input-field !py-2 text-sm flex-1" />
                      <button onClick={() => placeOrder(l.id)} className="btn-primary !py-2 text-sm">Buy</button>
                    </div>
                  )}
                  {l.seller_id === user?.id && <span className="badge-amber">Your listing</span>}
                </div>
              ))}
            </div>
          )}

          {/* My Listings Tab */}
          {tab === 'my' && (
            <div className="space-y-3">
              {myListings.length === 0 ? (
                <div className="text-center py-16 text-gray-500"><p>You haven't listed anything yet.</p></div>
              ) : myListings.map(l => (
                <div key={l.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white">{l.title}</span>
                    <span className="badge-green ml-2">{l.crop_type}</span>
                    <div className="text-sm text-gray-400 mt-1">{l.quantity_kg} kg • ₹{l.price_per_kg}/kg</div>
                  </div>
                  <button onClick={() => deleteListing(l.id)} className="text-red-400 hover:text-red-300 text-sm hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all">Delete</button>
                </div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-500"><p>No orders yet.</p></div>
              ) : orders.map(o => (
                <div key={o.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-white">{o.quantity_kg} kg</span>
                      <span className={`ml-2 badge ${o.status === 'pending' ? 'badge-amber' : 'badge-green'}`}>{o.status}</span>
                      <span className="ml-2 text-sm text-gray-400">{o.buyer_id === user?.id ? '(You bought)' : '(You sold)'}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary-400">₹{o.total_price?.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
