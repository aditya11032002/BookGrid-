import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#fbf8f2] shadow-sm p-8 border border-amber-900/15">
        <p className="text-[11px] text-center uppercase tracking-[0.18em] text-[#7d1c22] mb-3">Members Only</p>
        <h2 className="text-5xl display-serif text-center text-[#1a0f11] mb-8">Welcome Back</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 mb-1">Email</label>
            <input 
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-800 transition"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#7d1c22] hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>
            <input 
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-800 transition"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#111217] text-white font-semibold py-3 hover:bg-[#7d1c22] transition disabled:bg-gray-400 uppercase tracking-[0.14em] text-xs">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-[#1a0f11] font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
