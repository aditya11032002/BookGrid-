import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
    
    // Listen for wishlist updates from other components
    const handleWishlistUpdate = () => {
      setTimeout(fetchWishlist, 500); // Small delay to ensure API has processed
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data.data);
    } catch (err) {
      console.error("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/api/v1/users/wishlist/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The API returns the updated array, but we can also just filter locally or set from response
      setWishlist(res.data.data);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      successMsg.textContent = 'Removed from wishlist!';
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        document.body.removeChild(successMsg);
      }, 2000);
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
      
      // Fallback: remove locally if API fails
      setWishlist(prev => prev.filter(book => book._id !== bookId));
      
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      errorMsg.textContent = 'Failed to remove from wishlist';
      document.body.appendChild(errorMsg);
      
      setTimeout(() => {
        document.body.removeChild(errorMsg);
      }, 3000);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Heart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Wishlist</h2>
        <p className="text-slate-600 mb-8">Please log in to save books for later.</p>
        <Link to="/login" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-current" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Wishlist</h1>
          <span className="ml-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold text-sm">
            {wishlist.length} Items
          </span>
        </div>
        <button
          onClick={fetchWishlist}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Refresh
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-16 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Found a book you like but not ready to buy? Tap the heart icon to save it here.</p>
          <Link to="/shop" className="inline-flex bg-amber-400 text-amber-950 px-8 py-3 rounded-xl font-bold hover:bg-amber-300 transition">
            Explore Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((book) => (
            <div key={book._id} className="group flex flex-col bg-white border border-slate-100 rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden relative">
              <button 
                onClick={() => removeFromWishlist(book._id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <Link to={`/books/${book._id}`} className="block relative bg-slate-50 aspect-[4/5] overflow-hidden">
                <img src={book.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={book.title} />
              </Link>
              
              <div className="p-5 flex flex-col flex-grow">
                <Link to={`/books/${book._id}`}>
                  <h3 className="font-bold text-slate-900 hover:text-amber-600 transition line-clamp-1 mb-1">{book.title}</h3>
                </Link>
                <p className="text-xs text-slate-500 mb-4 truncate">{book.author}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <p className="font-bold text-slate-900 text-lg">${book.price.toFixed(2)}</p>
                  <button 
                    onClick={() => { addToCart(book); removeFromWishlist(book._id); }}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
