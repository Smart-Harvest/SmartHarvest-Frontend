import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Red', 'Black'];

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    soil_type: '',
    farm_size_acres: '',
  });
  const [error, setError] = useState('');
  const { register, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      farm_size_acres: form.farm_size_acres ? parseFloat(form.farm_size_acres) : null,
      soil_type: form.soil_type || null,
      location: form.location || null,
    };
    const result = await register(payload);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌾</div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Join AgriSmart</h1>
          <p className="text-gray-400">Create your farmer profile and get started</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm animate-slide-down">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                <input id="reg-name" name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="John Doe" required />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="farmer@example.com" required />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
              <input id="reg-password" name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" required minLength={6} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-location" className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
                <input id="reg-location" name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="City, State" />
              </div>
              <div>
                <label htmlFor="reg-soil" className="block text-sm font-medium text-gray-300 mb-1.5">Soil Type</label>
                <select id="reg-soil" name="soil_type" value={form.soil_type} onChange={handleChange} className="input-field">
                  <option value="">Select soil type</option>
                  {SOIL_TYPES.map((s) => (
                    <option key={s} value={s.toLowerCase()}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reg-farm" className="block text-sm font-medium text-gray-300 mb-1.5">Farm Size (acres)</label>
              <input id="reg-farm" name="farm_size_acres" type="number" step="0.1" value={form.farm_size_acres} onChange={handleChange} className="input-field" placeholder="e.g. 10.5" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
