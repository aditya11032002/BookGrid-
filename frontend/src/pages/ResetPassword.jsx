import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const { resettoken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await axios.put(
        `/api/v1/auth/resetpassword/${resettoken}`,
        { password }
      );
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Reset failed. The link may have expired.');
    }
  };

  // ─── Password strength indicator ────────────────────────────────────────────
  const getStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'transparent', width: '0%' };
    if (pwd.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (pwd.length < 8) return { label: 'Weak', color: '#f97316', width: '40%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Fair', color: '#eab308', width: '65%' };
    return { label: 'Strong', color: '#22c55e', width: '100%' };
  };
  const strength = getStrength(password);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#fbf8f2] shadow-sm p-8 border border-amber-900/15">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: status === 'success'
              ? 'linear-gradient(135deg, #166534, #22c55e)'
              : 'linear-gradient(135deg, #1a1a2e, #7d1c22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, transition: 'background 0.4s'
          }}>
            {status === 'success' ? '✅' : '🔑'}
          </div>
        </div>

        <p className="text-[11px] text-center uppercase tracking-[0.18em] text-[#7d1c22] mb-2">
          Set New Password
        </p>
        <h2 className="text-4xl display-serif text-center text-[#1a0f11] mb-3">
          Reset Password
        </h2>

        {/* Success State */}
        {status === 'success' ? (
          <div className="text-center mt-4">
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 8, padding: '20px 24px', marginBottom: 24
            }}>
              <p style={{ color: '#166534', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                Password Reset Successful!
              </p>
              <p style={{ color: '#15803d', fontSize: 14 }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#111217] text-white font-semibold py-3 hover:bg-[#7d1c22] transition uppercase tracking-[0.14em] text-xs"
            >
              Go to Sign In →
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-center text-gray-500 mb-8">
              Choose a strong password (at least 6 characters).
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
                  {message}
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 pr-12 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-800 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: 16, color: '#888'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{
                      height: 4, borderRadius: 4,
                      background: '#e5e7eb', overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        width: strength.width,
                        background: strength.color,
                        transition: 'width 0.3s, background 0.3s'
                      }} />
                    </div>
                    <p style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 600 }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-800 transition"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                    Passwords don't match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>
                    ✓ Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#111217] text-white font-semibold py-3 hover:bg-[#7d1c22] transition disabled:bg-gray-400 uppercase tracking-[0.14em] text-xs"
              >
                {status === 'loading' ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link to="/forgot-password" className="text-[#7d1c22] font-medium hover:underline">
                  Request a new reset link
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
