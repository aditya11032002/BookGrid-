import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, ChevronDown, UserCog, Shield, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#1a0f11] text-amber-100 px-4 py-2 text-center text-xs sm:text-sm font-medium tracking-[0.18em] uppercase">
        Limited Time Offer. <Link to="/shop" className="underline ml-2 hover:text-amber-300 transition">Shop Books</Link>
      </div>

      <nav className="sticky top-0 z-50 bg-[#f6efe4] shadow-sm border-b border-amber-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold tracking-tight text-[#1a0f11] flex items-center gap-2">
              <div className="w-8 h-8 bg-[#5d0d11] text-amber-100 text-xl rounded-md flex items-center justify-center font-bold shadow-sm">C</div>
              <span className="display-serif not-italic">Crossread</span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full flex">
                <input
                  type="text"
                  placeholder="Search by Title, Author, Publisher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full bg-white border border-r-0 border-amber-900/20 rounded-l-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition text-sm"
                />
                <button 
                  onClick={() => searchTerm.trim() && navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`)}
                  className="bg-[#1a0f11] text-amber-50 px-4 rounded-r-lg border border-[#1a0f11] hover:bg-[#33191d] transition"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-[#3e2b2f] hover:text-[#7d1c22] transition focus:outline-none"
                  >
                    <span className="text-sm font-medium hidden sm:block">Hi, {user.name.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-amber-900/10 py-2 z-50">
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center font-medium border-b border-gray-50">
                          <Shield className="h-4 w-4 mr-2" /> Admin Panel
                        </Link>
                      )}
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                        <UserCog className="h-4 w-4 mr-2" /> Update Profile
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-[#3e2b2f] hover:text-[#7d1c22] transition flex items-center gap-1 text-sm font-medium" title="Login">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
              
              <Link to="/wishlist" className="text-[#3e2b2f] hover:text-[#7d1c22] transition flex items-center gap-1 text-sm font-medium" title="Wishlist">
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Wishlist</span>
              </Link>
              
              <Link to="/cart" className="relative text-[#3e2b2f] hover:text-[#7d1c22] transition flex items-center gap-1 text-sm font-medium" title="Cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#7d1c22] text-amber-50 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="bg-[#fbf8f2] border-t border-amber-900/10 shadow-sm hidden md:block relative z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex gap-8 overflow-x-auto whitespace-nowrap py-3">
              <Link to="/shop" className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#221316] hover:text-[#7d1c22] transition">Books</Link>
              <Link to="/shop?genre=Fiction" className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#221316] hover:text-[#7d1c22] transition">Fiction</Link>
              <Link to="/shop?genre=Non-Fiction" className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#221316] hover:text-[#7d1c22] transition">Non-Fiction</Link>
              <Link to="/shop?genre=Business" className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#221316] hover:text-[#7d1c22] transition">Business</Link>
              <Link to="/shop?genre=Children's" className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#221316] hover:text-[#7d1c22] transition">Children's</Link>
              <Link to="/shop?genre=Young+Adult" className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#221316] hover:text-[#7d1c22] transition">Young Adult</Link>
              <Link to="/shop?genre=Mystery" className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#221316] hover:text-[#7d1c22] transition">Mystery</Link>
              <Link to="/shop?genre=Fantasy" className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#221316] hover:text-[#7d1c22] transition">Fantasy</Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
