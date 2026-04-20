import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await axios.post('http://localhost:5000/api/v1/auth/forgotpassword', { email });
      setStatus('success');
      setMessage('Password reset email sent! Check your inbox (and spam folder).');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#fbf8f2] shadow-sm p-8 border border-amber-900/15">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a1a2e, #7d1c22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24
          }}>
            🔐
          </div>
        </div>

        <p className="text-[11px] text-center uppercase tracking-[0.18em] text-[#7d1c22] mb-2">
          Account Recovery
        </p>
        <h2 className="text-4xl display-serif text-center text-[#1a0f11] mb-3">
          Forgot Password?
        </h2>
        <p className="text-sm text-center text-gray-500 mb-8">
          Enter your registered email and we'll send you a secure reset link.
        </p>

        {/* Success State */}
        {status === 'success' ? (
          <div className="text-center">
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 8, padding: '20px 24px', marginBottom: 24
            }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📬</p>
              <p style={{ color: '#166534', fontWeight: 600, marginBottom: 4 }}>Email Sent!</p>
              <p style={{ color: '#15803d', fontSize: 14 }}>{message}</p>
            </div>
            <Link
              to="/login"
              className="text-sm text-[#7d1c22] font-medium hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === 'error' && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
                {message}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-800 transition"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#111217] text-white font-semibold py-3 hover:bg-[#7d1c22] transition disabled:bg-gray-400 uppercase tracking-[0.14em] text-xs"
            >
              {status === 'loading' ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link to="/login" className="text-[#1a0f11] font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
