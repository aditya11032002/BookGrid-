import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Trash2, ShieldAlert, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user: currentUser } = useAuth(); // Logged-in admin

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (err) {
      setError("Failed to load users data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the user '${name}'? This action cannot be undone.`)) {
      try {
        setError('');
        setSuccess('');
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(`User '${name}' deleted successfully.`);
        fetchUsers(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to delete user.');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Users className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Registered Accounts</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold w-1/4">Name</th>
                <th className="py-4 px-6 font-semibold w-1/3">Email Address</th>
                <th className="py-4 px-6 font-semibold w-1/6">Role</th>
                <th className="py-4 px-6 font-semibold w-1/6">Joined Date</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No users found in the database.
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isSelf = currentUser?._id === u._id || currentUser?.id === u._id;
                  
                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition group">
                      <td className="py-4 px-6">
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {u.name}
                          {isSelf && <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] text-slate-700 font-bold uppercase tracking-wide">You</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {u.role === 'admin' && <Shield className="w-3 h-3" />}
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          disabled={isSelf} // Prevent deleting oneself
                          className={`p-2 rounded-lg transition-colors ${
                            isSelf 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-red-400 hover:bg-red-50 hover:text-red-600'
                          }`}
                          title={isSelf ? "You cannot delete your own account" : "Delete User"}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
