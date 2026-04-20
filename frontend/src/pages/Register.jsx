import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#fbf8f2] shadow-sm p-8 border border-amber-900/15">
        <p className="text-[11px] text-center uppercase tracking-[0.18em] text-[#7d1c22] mb-3">Join Crossread</p>
        <h2 className="text-5xl display-serif text-center text-[#1a0f11] mb-8">Create Account</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" required
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-800 transition"
          />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 mb-1">Email</label>
            <input 
              type="email" required
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-800 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 mb-1">Password</label>
            <input 
              type="password" required minLength="6"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-800 transition"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#111217] text-white font-semibold py-3 hover:bg-[#7d1c22] transition disabled:bg-gray-400 uppercase tracking-[0.14em] text-xs">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-[#1a0f11] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
