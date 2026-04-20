import { useState, useEffect } from 'react';
import axios from 'axios';
import logger from '../../utils/logger';
import { Users, Book, ShoppingBag, DollarSign, TrendingUp, TrendingDown, Activity, Package, Star, Eye, Clock, ArrowUp, ArrowDown, BarChart3, PieChart, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    books: 0
  });
  const [timeRange, setTimeRange] = useState('week'); // day, week, month, year
  const [realTimeData, setRealTimeData] = useState({
    recentActivity: [],
    salesData: [],
    topProducts: [],
    cartStats: { totalItems: 0, totalValue: 0 },
    wishlistStats: { totalItems: 0, totalUsers: 0 }
  });
  const [logSummary, setLogSummary] = useState(null);

  // Process real-time data from logger
  const processRealTimeData = () => {
    const logs = logger.logs;
    const summary = logger.getLogSummary();
    setLogSummary(summary);

    // Process recent activity
    const recentActivity = logs
      .filter(log => ['CART_ADD', 'CART_REMOVE', 'AUTH_LOGIN_SUCCESS', 'AUTH_REGISTER_SUCCESS', 'WISHLIST_ADD'].includes(log.action))
      .slice(-10)
      .reverse()
      .map(log => {
        const actionMap = {
          'CART_ADD': { type: 'order', action: 'added item to cart', icon: <ShoppingBag className="w-4 h-4" /> },
          'CART_REMOVE': { type: 'order', action: 'removed item from cart', icon: <ShoppingBag className="w-4 h-4" /> },
          'AUTH_LOGIN_SUCCESS': { type: 'user', action: 'logged in', icon: <Users className="w-4 h-4" /> },
          'AUTH_REGISTER_SUCCESS': { type: 'user', action: 'created an account', icon: <Users className="w-4 h-4" /> },
          'WISHLIST_ADD': { type: 'wishlist', action: 'added book to wishlist', icon: <Eye className="w-4 h-4" /> }
        };
        
        const mapped = actionMap[log.action] || { type: 'general', action: log.action, icon: <Activity className="w-4 h-4" /> };
        
        return {
          ...mapped,
          user: log.data?.email || log.data?.item?.title || 'Anonymous',
          value: log.data?.item?.title || log.data?.email || '',
          time: getRelativeTime(log.timestamp),
          timestamp: log.timestamp
        };
      });

    // Process cart statistics
    const cartLogs = logs.filter(log => log.action.startsWith('CART_'));
    const cartStats = {
      totalItems: cartLogs.filter(log => log.action === 'CART_ADD').length,
      totalValue: cartLogs.reduce((sum, log) => sum + (log.data?.total || 0), 0)
    };

    // Process wishlist statistics
    const wishlistLogs = logs.filter(log => log.action.startsWith('WISHLIST_'));
    const wishlistStats = {
      totalItems: wishlistLogs.filter(log => log.action === 'WISHLIST_ADD').length,
      totalUsers: new Set(wishlistLogs.map(log => log.data?.email)).size
    };

    // Process top products from cart data
    const productCounts = {};
    cartLogs.forEach(log => {
      if (log.data?.item?.title) {
        productCounts[log.data.item.title] = (productCounts[log.data.item.title] || 0) + 1;
      }
    });
    
    const topProducts = Object.entries(productCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, sales], index) => ({
        name,
        sales,
        rating: (Math.random() * 1 + 4).toFixed(1) // Mock rating for now
      }));

    // Process sales data by day
    const salesByDay = {};
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => salesByDay[day] = 0);
    
    cartLogs.forEach(log => {
      const day = new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
      if (salesByDay[day] !== undefined) {
        salesByDay[day] += log.data?.total || 0;
      }
    });

    const salesData = days.map(day => ({
      day,
      value: salesByDay[day]
    }));

    setRealTimeData({
      recentActivity,
      salesData,
      topProducts,
      cartStats,
      wishlistStats
    });
  };

  // Get relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/v1/admin/stats');
        setStats(res.data.data);
        processRealTimeData();
      } catch (err) {
        console.error("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // Update real-time data every 5 seconds
    const interval = setInterval(() => {
      processRealTimeData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Animate numbers when stats are loaded
  useEffect(() => {
    if (!stats) return;

    const animateValue = (start, end, duration, key) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3); // Easing function
        
        if (key === 'revenue') {
          setAnimatedValues(prev => ({ ...prev, [key]: start + (end - start) * easeOut }));
        } else {
          setAnimatedValues(prev => ({ ...prev, [key]: Math.floor(start + (end - start) * easeOut) }));
        }

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    animateValue(0, stats.totalRevenue, 2000, 'revenue');
    animateValue(0, stats.totalOrders, 1500, 'orders');
    animateValue(0, stats.totalUsers, 1800, 'users');
    animateValue(0, stats.totalBooks, 1200, 'books');
  }, [stats]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
    </div>
  );
  
  if (!stats) return <div className="p-8 text-red-500 font-medium bg-red-50 rounded-2xl">Error loading analytics data. Connection failed.</div>;

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `$${animatedValues.revenue.toFixed(2)}`, 
      icon: <DollarSign className="h-6 w-6 text-emerald-600" />, 
      bg: 'bg-emerald-100',
      trend: '+12.5%',
      trendUp: true,
      subtitle: 'vs last month'
    },
    { 
      title: 'Total Orders', 
      value: animatedValues.orders, 
      icon: <ShoppingBag className="h-6 w-6 text-blue-600" />, 
      bg: 'bg-blue-100',
      trend: '+8.2%',
      trendUp: true,
      subtitle: 'vs last month'
    },
    { 
      title: 'Total Users', 
      value: animatedValues.users, 
      icon: <Users className="h-6 w-6 text-purple-600" />, 
      bg: 'bg-purple-100',
      trend: '+15.3%',
      trendUp: true,
      subtitle: 'vs last month'
    },
    { 
      title: 'Total Books', 
      value: animatedValues.books, 
      icon: <Book className="h-6 w-6 text-orange-600" />, 
      bg: 'bg-orange-100',
      trend: '+5.7%',
      trendUp: true,
      subtitle: 'vs last month'
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === range 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Real-time Stats Summary */}
      {logSummary && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Real-time Statistics</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{logSummary.totalLogs}</p>
              <p className="text-xs text-gray-600">Total Events</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{realTimeData.cartStats.totalItems}</p>
              <p className="text-xs text-gray-600">Cart Actions</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{realTimeData.wishlistStats.totalItems}</p>
              <p className="text-xs text-gray-600">Wishlist Actions</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{logSummary.errors}</p>
              <p className="text-xs text-gray-600">Errors</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${card.bg} animate-pulse`}>
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                card.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {card.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
              <p className="text-xs text-gray-400">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {realTimeData.salesData.map((data, index) => (
              <div key={data.day} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-8">{data.day}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: data.value > 0 ? `${Math.min((data.value / 10000) * 100, 100)}%` : '0%',
                      animation: `slideIn 1s ease-out ${index * 0.1}s both`
                    }}
                  >
                    {data.value > 0 && (
                      <span className="absolute right-2 top-1 text-xs text-white font-medium">
                        ${data.value.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {realTimeData.topProducts.length > 0 ? (
              realTimeData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-500">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{product.sales}</p>
                    <p className="text-xs text-gray-500">sales</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No product data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {realTimeData.recentActivity.length > 0 ? (
            realTimeData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'user' ? 'bg-green-100 text-green-600' :
                  activity.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                    {activity.value && <span className="font-medium text-gray-700"> {activity.value}</span>}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Order ID</th>
                <th className="py-4 px-6 font-semibold">Customer</th>
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Total</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 text-sm font-mono text-gray-900">#{order._id.substring(0, 8)}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">{order.user?.name || 'Unknown User'}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">${order.totalPrice.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
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
