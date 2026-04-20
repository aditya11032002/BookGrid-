import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/routing/AdminRoute';
import LoggerPanel from './components/debug/LoggerPanel';
import logger from './utils/logger';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';

// Standard Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Public layout wrapper
const PublicLayout = () => (
  <>
    <Navbar />
    <main className="flex-grow flex flex-col min-h-[80vh]">
      <Outlet />
    </main>
    <footer className="border-t border-amber-900/10 bg-[#130f10] py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-amber-50/80 text-sm tracking-wide">
        &copy; {new Date().getFullYear()} Crossread. Crafted for curious readers.
      </div>
    </footer>
  </>
);

function App() {
  useEffect(() => {
    // Initialize logger
    logger.init();
    
    // Log page views
    const handlePageView = (path) => {
      const pageName = path === '/' ? 'Home' : 
                       path.startsWith('/shop') ? 'Shop' :
                       path.startsWith('/books/') ? 'BookDetail' :
                       path.startsWith('/admin') ? 'Admin' :
                       path.replace('/', '').charAt(0).toUpperCase() + path.slice(1);
      logger.logPageView(pageName, { path });
    };

    // Log initial page
    handlePageView(window.location.pathname);

    // Listen for route changes
    const handleRouteChange = () => {
      handlePageView(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-transparent font-sans text-slate-900 flex flex-col antialiased">
            <Routes>
              {/* Admin Routes - Protected & Isolated Layout */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="books" element={<AdminBooks />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                </Route>
              </Route>
              
              {/* Public Routes with Navbar */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
              </Route>
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
      <LoggerPanel />
    </BrowserRouter>
  );
}

export default App;
