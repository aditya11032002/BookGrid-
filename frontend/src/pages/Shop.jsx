import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Filter, Search, X, Heart, Star, Grid, List, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from '../utils/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for filters
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const searchQuery = searchParams.get('search') || '';
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState([]);
  const [hoveredBook, setHoveredBook] = useState(null);

  const genres = ['Fiction', 'Non-Fiction', 'Business', "Children's", 'Young Adult', 'Mystery', 'Fantasy'];

  const fetchFilteredBooks = useCallback(async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (genre) queryParams.append('genre', genre);
      if (sort) queryParams.append('sort', sort);

      const url = `/api/v1/books?${queryParams.toString()}`;
        
      const res = await axios.get(url);
      
      let fetchedBooks = res.data.data;
      
      // Handle sorting for frontend if backend doesn't support specific sort options
      if (sort === 'price_asc') fetchedBooks.sort((a,b) => a.price - b.price);
      if (sort === 'price_desc') fetchedBooks.sort((a,b) => b.price - a.price);
      if (sort === 'rating_desc') fetchedBooks.sort((a,b) => b.rating - a.rating);
      if (sort === 'rating_asc') fetchedBooks.sort((a,b) => a.rating - b.rating);
      if (sort === 'title_asc') fetchedBooks.sort((a,b) => a.title.localeCompare(b.title));
      if (sort === 'title_desc') fetchedBooks.sort((a,b) => b.title.localeCompare(a.title));

      setBooks(fetchedBooks);
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, genre, sort]);

  useEffect(() => {
    // Debounce search to prevent rapid API calls
    const timerId = setTimeout(() => {
      fetchFilteredBooks();
    }, 300);

    return () => clearTimeout(timerId);
  }, [fetchFilteredBooks]);

  const updateFilter = (type, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    setSearchParams(newParams);
    
    if (type === 'genre') setGenre(value);
    if (type === 'sort') setSort(value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchInput('');
    updateFilter('search', '');
  };

  const toggleWishlist = (bookId) => {
    setWishlist(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 w-full flex-grow">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24 bg-[#fbf8f2] rounded-none p-6 border border-amber-900/15 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-xl font-bold text-[#1a0f11]">
            <Filter className="w-5 h-5" /> Filters
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Genres</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="genre" 
                  checked={genre === ''} 
                  onChange={() => updateFilter('genre', '')}
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900 border-slate-300"
                />
                <span className={`text-sm ${genre === '' ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900 transition'}`}>All Genres</span>
              </label>
              {genres.map(g => (
                <label key={g} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="genre" 
                    checked={genre === g} 
                    onChange={() => updateFilter('genre', g)}
                    className="w-4 h-4 text-slate-900 focus:ring-slate-900 border-slate-300"
                  />
                  <span className={`text-sm ${genre === g ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900 transition'}`}>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Sort By</h3>
            <select 
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full bg-white border border-amber-900/20 rounded-none p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-700 transition shadow-sm cursor-pointer"
            >
              <option value="">Most Relevant</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Rating: High to Low</option>
              <option value="rating_asc">Rating: Low to High</option>
              <option value="title_asc">Title: A to Z</option>
              <option value="title_desc">Title: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-300/70 pb-6">
          {/* Animated Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
                <h1 className="text-5xl display-serif text-[#1a0f11] bg-gradient-to-r from-[#1a0f11] to-[#7d1c22] bg-clip-text text-transparent">
                  {searchQuery ? `Search: "${searchQuery}"` : 'Book Catalog'}
                </h1>
              </div>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                  {books.length} books
                </span>
                {searchQuery && (
                  <span className="text-xs text-slate-400">matching your search</span>
                )}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search books, authors..."
                className="w-full pl-10 pr-10 py-3 border border-amber-900/20 rounded-none focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-700 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg bg-white/80 backdrop-blur-sm"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 font-medium">View:</span>
              <div className="inline-flex rounded-lg border border-amber-900/20 bg-white p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
           <div className="space-y-8">
             {/* Loading Skeletons */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="animate-pulse">
                   <div className="bg-slate-200 aspect-[3/4] rounded-lg mb-4"></div>
                   <div className="h-4 bg-slate-200 rounded mb-2"></div>
                   <div className="h-3 bg-slate-200 rounded w-3/4 mb-3"></div>
                   <div className="flex justify-between items-center">
                     <div className="h-4 bg-slate-200 rounded w-16"></div>
                     <div className="h-8 bg-slate-200 rounded-full w-8"></div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        ) : books.length === 0 ? (
          <div className="text-center py-32 bg-gradient-to-br from-slate-50 to-amber-50 rounded-2xl border border-amber-200/50 shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No books found</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Try adjusting your filters or search term to discover your next great read.</p>
            <button 
              onClick={() => { 
                setSearchInput(''); 
                updateFilter('search', ''); 
                updateFilter('genre', ''); 
                updateFilter('sort', ''); 
              }} 
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={`space-y-8 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : ''}`}>
            {books.map((book, index) => (
               <div 
                 key={book._id} 
                 className={`group text-left flex bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                   viewMode === 'list' ? 'flex-row gap-4 p-4' : 'flex-col h-full relative'
                 }`}
                 style={{ animationDelay: `${index * 100}ms` }}
                 onMouseEnter={() => setHoveredBook(book._id)}
                 onMouseLeave={() => setHoveredBook(null)}
               >
                  {/* Book Cover */}
                  <div className={`relative ${viewMode === 'list' ? 'w-24 h-32 flex-shrink-0' : 'bg-[#f3eee4] aspect-[3/4] mb-4'} overflow-hidden`}>
                    <Link to={`/books/${book._id}`} className="block w-full h-full">
                      <img 
                        src={book.coverImage} 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                        alt={book.title} 
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-1 text-white text-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{book.rating.toFixed(1)}</span>
                            <span className="text-white/60">({Math.floor(Math.random() * 100) + 10})</span>
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
                      title={wishlist.includes(book._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(book._id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Book Info */}
                  <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 justify-between' : 'flex-grow justify-between'}`}>
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link 
                          to={`/books/${book._id}`} 
                          className="flex-1"
                        >
                          <h3 className={`font-semibold text-[#1a0f11] hover:text-[#7d1c22] transition-colors duration-200 ${
                            viewMode === 'list' ? 'text-lg' : 'display-serif text-lg line-clamp-2'
                          }`} 
                          title={book.title}
                        >
                          {book.title}
                        </h3>
                        </Link>
                      </div>
                      
                      <p className="text-xs text-slate-500 uppercase tracking-[0.14em] mb-2">{book.author}</p>
                      
                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {book.genre.slice(0, 2).map(g => (
                          <span 
                            key={g}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
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
                        </div>
                        <span className="text-xs text-slate-500">{book.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    {/* Price and Actions */}
                    <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'mt-0' : 'mt-3'}`}>
                      <div>
                        <p className="font-bold text-lg text-slate-900">${book.price.toFixed(2)}</p>
                        {book.stock > 0 ? (
                          <p className="text-xs text-green-600">In Stock ({book.stock})</p>
                        ) : (
                          <p className="text-xs text-red-600">Out of Stock</p>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); addToCart(book); }}
                        disabled={book.stock === 0}
                        className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none ${
                          book.stock === 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                        title={book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
