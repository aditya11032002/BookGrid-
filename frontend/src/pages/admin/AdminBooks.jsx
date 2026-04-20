import { useState } from 'react';
import axios from 'axios';
import { Book, Plus, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminBooks() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    stock: '',
    description: '',
    coverImage: '',
    language: 'English',
    genre: []
  });

  const availableGenres = [
    'Fiction', 'Non-Fiction', 'Business', "Children's", 
    'Young Adult', 'Mystery', 'Fantasy'
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenreChange = (genre) => {
    setFormData(prev => {
      const currentGenres = [...prev.genre];
      if (currentGenres.includes(genre)) {
        return { ...prev, genre: currentGenres.filter(g => g !== genre) };
      } else {
        return { ...prev, genre: [...currentGenres, genre] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (formData.genre.length === 0) {
        throw new Error("Please select at least one genre.");
      }

      const token = localStorage.getItem('token'); // Assuming JWT is stored here
      await axios.post('/api/v1/books', {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Successfully added book: ${formData.title}`);
      
      // Reset form
      setFormData({
        title: '', author: '', price: '', stock: '', description: '', coverImage: '', language: 'English', genre: []
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Book Management</h1>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <Plus className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Add New Book</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Book Title *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleInputChange} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" 
                placeholder="E.g., The Hobbit" />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Author *</label>
              <input required type="text" name="author" value={formData.author} onChange={handleInputChange} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" 
                placeholder="E.g., J.R.R. Tolkien" />
            </div>

            {/* Price & Stock */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Price (₹) *</label>
              <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleInputChange} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" 
                placeholder="299.00" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Initial Stock *</label>
              <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" 
                placeholder="50" />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Cover Image URL</label>
              <input type="text" name="coverImage" value={formData.coverImage} onChange={handleInputChange} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" 
                placeholder="https://example.com/image.jpg" />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Language</label>
              <input type="text" name="language" value={formData.language} onChange={handleInputChange} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition" />
            </div>
          </div>

          {/* Genres Section - The specific focus for future books request */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-sm font-semibold text-slate-700">Select Genres *</label>
            <div className="flex flex-wrap gap-3">
              {availableGenres.map(genre => {
                const isSelected = formData.genre.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreChange(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                      isSelected 
                      ? 'bg-amber-400 border-amber-400 text-amber-950 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400 hover:text-slate-900'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-sm font-semibold text-slate-700">Description *</label>
            <textarea required rows="4" name="description" value={formData.description} onChange={handleInputChange} 
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition resize-none" 
              placeholder="Write a brief synopsis about the book..."></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Book className="w-5 h-5" /> Save Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
