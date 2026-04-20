import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.data);
      } catch (err) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">All Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Order ID</th>
                <th className="py-4 px-6 font-semibold">Customer</th>
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Amount</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No orders found in the system.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition group">
                    <td className="py-4 px-6 text-sm font-mono text-slate-500 group-hover:text-slate-900 transition">#{order._id.substring(0, 8)}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-slate-900">{order.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{order.user?.email}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900">₹{order.totalPrice.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                        {order.status === 'Shipped' && <Truck className="w-3 h-3" />}
                        {order.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
