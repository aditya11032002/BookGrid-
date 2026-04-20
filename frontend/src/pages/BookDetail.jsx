import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, MessageSquare, Send, Heart, Sparkles, BookOpen, Calendar, Globe, Award, TrendingUp, Share2, Copy, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';
import axios from 'axios';

export default function BookDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/v1/books/${id}/reviews`);
      setReviews(res.data.data);
    } catch (err) {
      console.error("Failed to fetch reviews");
    }
  };

  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [addedToCartMessage, setAddedToCartMessage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const fetchWishlistStatus = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Check if current book is in wishlist
      const exists = res.data.data.some(w => w._id === id);
      setInWishlist(exists);
    } catch (err) {
      console.error("Failed to verify wishlist status");
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const url = axios.defaults.baseURL ? `/api/v1/books/${id}` : `http://localhost:5000/api/v1/books/${id}`;
        const res = await axios.get(url);
        setBook(res.data.data);
        fetchReviews();
        fetchWishlistStatus();
      } catch (err) {
        setError('Book not found or API is down.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, user]);

  const handleToggleWishlist = async () => {
    if (!user) {
      alert("Please log in to save items to your wishlist.");
      logger.log('warn', 'WISHLIST_LOGIN_REQUIRED', { bookId: id, bookTitle: book?.title });
      return;
    }
    setWishlistLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/v1/users/wishlist', { bookId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInWishlist(res.data.added);
      
      if (book) {
        logger.logWishlistAction(res.data.added ? 'add' : 'remove', book, { items: res.data.added ? [book] : [] });
      }
      
      // Notify other components that wishlist was updated
      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { action: res.data.added ? 'add' : 'remove', book }
      }));
    } catch (err) {
      logger.logError(err, { context: 'toggle_wishlist', bookId: id, bookTitle: book?.title });
      alert("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (book?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (book) {
      for (let i = 0; i < quantity; i++) {
        addToCart(book);
      }
      setAddedToCartMessage(`${quantity} ${quantity === 1 ? 'book' : 'books'} added to cart!`);
      setTimeout(() => setAddedToCartMessage(''), 3000);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToClipboard(true);
      setAddedToCartMessage('Link copied to clipboard!');
      setTimeout(() => {
        setCopiedToClipboard(false);
        setAddedToCartMessage('');
      }, 2000);
    } catch (err) {
      setAddedToCartMessage('Failed to copy link');
      setTimeout(() => setAddedToCartMessage(''), 2000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/v1/books/${id}/reviews`, {
        title: reviewTitle,
        text: reviewText,
        rating: reviewRating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReviewSuccess('Review submitted successfully!');
      setReviewTitle('');
      setReviewText('');
      setReviewRating(5);
      fetchReviews(); // Refresh review list
      
      // Update book data to refresh the average rating visually
      const bookRes = await axios.get(`/api/v1/books/${id}`);
      setBook(bookRes.data.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <div className="bg-slate-200 aspect-[3/4] rounded-lg animate-pulse shimmer"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-12 bg-slate-200 rounded w-1/3 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return <div className="text-center py-20 font-medium text-slate-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <Link to="/shop" className="inline-flex items-center text-xs uppercase tracking-[0.14em] text-slate-500 hover:text-[#7d1c22] mb-8 transition group">
        <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" /> 
        Back to books
      </Link>
      
      {/* Success Message */}
      {addedToCartMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce-in flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {addedToCartMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Enhanced Cover Image */}
        <div className="relative group">
          <div className="bg-[#f3eee4] overflow-hidden aspect-[3/4] rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
            <img 
              src={book.coverImage} 
              alt={book.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`flex-1 p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    inWishlist
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-slate-600 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-3 bg-white/90 text-slate-600 hover:bg-amber-600 hover:text-white rounded-full transition-all duration-300 transform hover:scale-110"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  {showShareMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl p-3 min-w-[150px]">
                      <button
                        onClick={() => {
                          handleShare();
                          setShowShareMenu(false);
                        }}
                        className="flex items-center gap-2 w-full text-left hover:bg-slate-100 rounded p-2 transition"
                      >
                        {copiedToClipboard ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-700">Copy link</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Book badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {book.rating >= 4.5 && (
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                <Award className="w-3 h-3" />
                Bestseller
              </span>
            )}
            {book.stock <= 5 && book.stock > 0 && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Only {book.stock} left!
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Info */}
        <div className="flex flex-col py-4">
          <div className="mb-6">
            <h1 className="text-6xl display-serif text-[#1a0f11] mb-2 bg-gradient-to-r from-[#1a0f11] to-[#7d1c22] bg-clip-text text-transparent animate-slide-in-right">
              {book.title}
            </h1>
            <p className="text-sm text-slate-500 uppercase tracking-[0.14em] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {book.author}
            </p>
          </div>
          
          {/* Enhanced Rating */}
          <div className="flex items-center mb-6 p-3 bg-amber-50 rounded-lg inline-block">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(book.rating) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="ml-2 text-sm font-semibold text-amber-800">{book.rating.toFixed(1)} / 5</span>
            <span className="ml-2 text-xs text-amber-600">({Math.floor(Math.random() * 200) + 50} reviews)</span>
          </div>

          {/* Price and Stock */}
          <div className="mb-8">
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-[#1a0f11]">${book.price.toFixed(2)}</p>
              {book.stock > 0 ? (
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  In Stock ({book.stock} available)
                </span>
              ) : (
                <span className="text-red-600 text-sm font-medium">Out of Stock</span>
              )}
            </div>
          </div>
          
          {/* Interactive Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-slate-200">
              {['description', 'details', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium capitalize transition-all duration-200 border-b-2 ${
                    activeTab === tab
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {activeTab === 'description' && (
              <div className="prose prose-sm text-slate-600 max-w-none animate-fade-in">
                <p className="text-lg leading-relaxed">{book.description || 'No description provided.'}</p>
              </div>
            )}
            {activeTab === 'details' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Published:</span>
                  <span className="font-medium">{book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Language:</span>
                  <span className="font-medium">{book.language}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Genres:</span>
                  <div className="flex gap-2">
                    {book.genre.map(g => (
                      <span key={g} className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.floor(book.rating) ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{book.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({reviews.length} reviews)</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Quantity Selector and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-lg font-bold">-</span>
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(book.stock, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center border-0 focus:ring-0"
                  min="1"
                  max={book.stock}
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= book.stock}
                  className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
              <span className="text-xs text-slate-500">({book.stock} available)</span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className={`flex-1 py-4 font-semibold text-sm uppercase tracking-[0.12em] flex items-center justify-center transition-all duration-300 transform hover:scale-105 focus:outline-none rounded-lg ${
                  book.stock === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl btn-shine'
                }`}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> 
                Add {quantity > 1 ? `${quantity} Books` : 'Book'} to Cart
              </button>
              <button 
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className={`p-4 rounded-xl border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none ${
                  inWishlist 
                    ? 'border-rose-500 bg-rose-50 text-rose-500 hover:bg-rose-100' 
                    : 'border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-400 hover:bg-rose-50'
                }`}
                title={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart className={`h-6 w-6 ${inWishlist && 'fill-current'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20 border-t border-slate-300 pt-16">
        <h2 className="text-5xl display-serif text-[#1a0f11] mb-8 flex items-center">
          <MessageSquare className="mr-3 w-8 h-8 text-amber-500" /> Customer Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="bg-[#fbf8f2] p-8 text-center text-slate-500">
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="bg-white p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{review.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        By {review.user?.name || 'Anonymous'} on {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{review.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Review Form */}
          <div className="bg-[#fbf8f2] p-8 border border-amber-900/15 h-fit">
            <h3 className="text-3xl display-serif text-[#1a0f11] mb-6">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl font-medium">{reviewSuccess}</div>}
                {reviewError && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{reviewError}</div>}
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        type="button" 
                        key={star} 
                        onClick={() => setReviewRating(star)}
                        className={`p-1 focus:outline-none transition ${reviewRating >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Headline</label>
                  <input required type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full border border-amber-900/20 rounded-none px-4 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" 
                    placeholder="Most important thing to know..." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Your Review</label>
                  <textarea required rows="4" value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                    className="w-full border border-amber-900/20 rounded-none px-4 py-3 focus:ring-2 focus:ring-amber-400 outline-none resize-none" 
                    placeholder="What did you like or dislike?"></textarea>
                </div>

                <button type="submit" className="w-full bg-[#111217] text-white py-3 font-bold hover:bg-[#7d1c22] transition flex items-center justify-center uppercase tracking-[0.12em] text-xs">
                  Post Review <Send className="w-4 h-4 ml-2" />
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-600 mb-4">You must be logged in to leave a review.</p>
                <Link to="/login" className="inline-block bg-amber-400 text-amber-950 px-6 py-2 rounded-xl font-bold hover:bg-amber-300 transition">
                  Log In Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
