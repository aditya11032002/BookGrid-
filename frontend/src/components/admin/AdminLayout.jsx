import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, ShoppingBag, Users, MessageSquare, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard /> },
    { name: 'Books', path: '/admin/books', icon: <Book /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag /> },
    { name: 'Users', path: '/admin/users', icon: <Users /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <MessageSquare /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-black" />
            Admin Panel
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 max-w-full">
          <div className="font-semibold text-gray-800 text-lg">
            {navItems.find(item => item.path === pathname || (pathname.startsWith(item.path) && item.path !== '/admin'))?.name || 'Admin'}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-semibold border border-blue-200">
              {user?.role.toUpperCase()}
            </span>
            <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
