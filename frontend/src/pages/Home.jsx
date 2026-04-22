import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronRight, Sparkles, Heart, ShoppingCart, Star, ArrowRight, BookOpen, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const { addToCart } = useCart();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBook, setHoveredBook] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('/api/v1/books');
        if (res.data && res.data.data) {
           setBooks(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching books", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const bestSellers = books.slice(0, 8);
  const comingSoonDeals = books.slice(8, 12); // Mocking coming soon

  // Helper to calculate mock discount for aesthetic purposes
  const getDiscountedPrice = (price) => (price * 0.85).toFixed(2);
  const getSavings = (price) => (price * 0.15).toFixed(2);

  const toggleWishlist = (bookId) => {
    setWishlist(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const banners = [
    {
      title: "BIG SALE IS LIVE",
      subtitle: "Up to 50% Off Top Authors",
      badge: "Limited Time",
      gradient: "from-[#5d0d11] via-[#3d090d] to-[#0f1117]"
    },
    {
      title: "NEW ARRIVALS",
      subtitle: "Bestselling Books This Month",
      badge: "Just In",
      gradient: "from-[#124a3d] via-[#0f3429] to-[#0d1f1a]"
    },
    {
      title: "AUTHOR SPOTLIGHT",
      subtitle: "Discover Award-Winning Writers",
      badge: "Featured",
      gradient: "from-[#1e3a8a] via-[#1e40af] to-[#172554]"
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Interactive Hero Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative w-full h-[320px] md:h-[460px] rounded-none overflow-hidden shadow-2xl">
          {/* Banner Carousel */}
          {banners.map((banner, index) => (
            <Link
              key={index}
              to="/shop"
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient} opacity-95`}></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="animate-bounce-in">
                  <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase bg-gradient-to-r from-amber-400 to-red-500 text-white px-3 py-1 mb-5 font-semibold inline-flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    {banner.badge}
                  </span>
                </div>
                <h1 className="display-serif text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[0.85] mb-6 animate-slide-in-up">
                  {banner.title}
                </h1>
                <p className="text-xl md:text-2xl text-amber-300 font-bold mb-8 uppercase tracking-widest animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                  {banner.subtitle}
                </p>
                <div className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                  <span className="bg-white text-black px-8 py-3.5 font-bold text-sm md:text-base uppercase tracking-[0.14em] hover:bg-amber-400 hover:text-black transition-all shadow-xl transform hover:scale-105 inline-flex items-center gap-2 btn-shine">
                    Shop The Collection
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Banner Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentBanner ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Category Cards */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-16">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/shop?genre=fiction" className="group relative h-48 overflow-hidden bg-gradient-to-br from-[#5d0d11] to-[#3d090d] rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl interactive-card">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="w-6 h-6 text-amber-400 animate-float" />
                        <p className="text-4xl md:text-5xl font-black text-white/25 leading-none display-serif not-italic">01.</p>
                    </div>
                    <h3 className="text-4xl font-bold display-serif text-white mb-2 group-hover:text-amber-400 transition-transform duration-300 group-hover:translate-x-2">Fiction & Literature</h3>
                    <p className="text-amber-100/85 flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                        Explore Award-Winning Tales 
                        <ChevronRight className="inline w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </p>
                </div>
            </Link>
            <Link to="/shop?genre=children" className="group relative h-48 overflow-hidden bg-gradient-to-br from-[#124a3d] to-[#0f3429] rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl interactive-card">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="w-6 h-6 text-emerald-400 animate-float" />
                        <p className="text-4xl md:text-5xl font-black text-white/25 leading-none display-serif not-italic">02.</p>
                    </div>
                    <h3 className="text-4xl font-bold display-serif text-white mb-2 group-hover:text-emerald-400 transition-transform duration-300 group-hover:translate-x-2">Children's Books</h3>
                    <p className="text-emerald-100/90 flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                        Inspire the Next Generation 
                        <ChevronRight className="inline w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </p>
                </div>
            </Link>
         </div>
      </div>

      {/* Best Sellers Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8 border-b border-slate-300/70 pb-3">
            <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-amber-600 animate-pulse" />
                <h2 className="text-5xl display-serif text-[#1a0f11] font-semibold bg-gradient-to-r from-[#1a0f11] to-[#7d1c22] bg-clip-text text-transparent">Best Sellers</h2>
            </div>
            <Link to="/shop" className="text-xs font-semibold uppercase tracking-[0.15em] hover:text-[#7d1c22] transition flex items-center gap-1 group">
                Show All 
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
        </div>
        
        {loading ? (
          <div className="space-y-8">
            <div className="flex overflow-x-auto gap-6 pb-6 hide-scrollbar">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[230px] animate-pulse">
                  <div className="bg-slate-200 aspect-[3/4] rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                    <div className="h-8 bg-slate-200 rounded-full w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {bestSellers.map((book, index) => (
               <div 
                 key={book._id} 
                 className="snap-start flex-shrink-0 min-w-[230px] w-[230px] group flex flex-col relative bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 interactive-card book-card"
                 style={{ animationDelay: `${index * 100}ms` }}
                 onMouseEnter={() => setHoveredBook(book._id)}
                 onMouseLeave={() => setHoveredBook(null)}
               >
                  {/* Book Cover */}
                  <div className="relative bg-[#f3eee4] aspect-[3/4] mb-4 overflow-hidden">
                    <Link to={`/books/${book._id}`} className="block w-full h-full">
                      <img 
                        src={book.coverImage} 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                        alt={book.title} 
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-1 text-white text-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{book.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist(book._id); }}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 transform ${
                        wishlist.includes(book._id)
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-white/90 text-slate-600 hover:bg-red-500 hover:text-white hover:scale-110'
                      } ${hoveredBook === book._id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(book._id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  {/* Book Info */}
                  <div className="flex flex-col flex-grow p-3">
                      <Link to={`/books/${book._id}`}>
                          <h3 className="font-bold text-[#1a0f11] hover:text-[#7d1c22] transition line-clamp-2 text-[15px] leading-tight mb-1 display-serif" title={book.title}>
                              {book.title}
                          </h3>
                      </Link>
                      <p className="text-xs text-slate-500 mb-2 truncate uppercase tracking-[0.14em]">{book.author}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < Math.floor(book.rating) 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300'
                            }`} 
                          />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">({book.rating.toFixed(1)})</span>
                      </div>
                      
                      <div className="mt-auto">
                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-xs text-slate-400 line-through">${book.price.toFixed(2)}</p>
                            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded animate-bounce">
                              SAVE ${(book.price * 0.15).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg text-red-600">${getDiscountedPrice(book.price)}</p>
                            <button
                              onClick={(e) => { e.preventDefault(); addToCart(book); }}
                              className="ml-auto p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg btn-shine"
                              title="Add to Cart"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                      </div>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>

       {/* Coming Soon Section */}
       <div className="w-full px-4 sm:px-6 lg:px-8 py-10 mb-20 bg-[#0d0f15] text-white mt-10">
        <div className="flex justify-between items-center mb-8 pb-3">
            <div>
               <p className="text-[10px] uppercase tracking-[0.2em] bg-[#f36f6f] text-white inline-block px-3 py-1 mb-4">Pre-order Exclusive</p>
               <h2 className="text-6xl font-semibold display-serif text-white leading-[0.85]">Coming<br/>Soon.</h2>
               <p className="text-sm text-slate-300 mt-4">Pre-order your next obsession.</p>
            </div>
            <Link to="/shop" className="text-xs font-semibold uppercase tracking-[0.15em] hover:text-amber-300 transition flex items-center gap-1 self-start mt-2">Show All <ChevronRight className="w-4 h-4"/></Link>
        </div>
        
        {loading ? (
           <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
             {comingSoonDeals.map((book) => (
                <div key={book._id + '_preorder'} className="snap-start flex-shrink-0 min-w-[220px] w-[220px] group flex flex-col relative">
                     <Link to={`/books/${book._id}`} className="block relative bg-slate-100 aspect-[3/4] mb-4 overflow-hidden">
                        <div className="absolute top-2 left-2 bg-white text-black text-[10px] font-bold px-2 py-1 z-10 uppercase tracking-widest">Pre-Order</div>
                        <img src={book.coverImage} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500" alt={book.title} />
                     </Link>
                     <div className="flex flex-col flex-grow text-left">
                         <Link to={`/books/${book._id}`}><h3 className="font-bold text-white hover:text-amber-300 transition line-clamp-1 text-lg mb-1 display-serif">{book.title}</h3></Link>
                         <p className="text-xs text-slate-300 mb-3 truncate uppercase tracking-[0.14em]">{book.author}</p>
                         
                         <p className="font-bold text-white mb-3">₹ {getDiscountedPrice(book.price)}</p>
                         <button 
                             onClick={(e) => { e.preventDefault(); addToCart(book); }}
                             className="mt-auto w-full border border-slate-300 text-slate-200 hover:bg-white hover:text-black font-medium py-2 transition-colors text-xs uppercase tracking-[0.14em]"
                         >
                             Pre-Order Now
                         </button>
                     </div>
                </div>
             ))}
          </div>
        )}
      </div>

    </div>
  );
}
