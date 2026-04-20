import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Trash2, Star, AlertCircle } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data.data);
    } catch (err) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReviews(reviews.filter(r => r._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Review Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">All Customer Reviews</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold w-1/4">Book</th>
                <th className="py-4 px-6 font-semibold w-1/4 flex-grow">Review details</th>
                <th className="py-4 px-6 font-semibold w-1/6">Rating</th>
                <th className="py-4 px-6 font-semibold w-1/6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No reviews have been posted.
                  </td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review._id} className="hover:bg-slate-50 transition group">
                    <td className="py-4 px-6 align-top">
                      <div className="text-sm font-bold text-slate-900">{review.book?.title || 'Deleted Book'}</div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="text-sm font-bold text-slate-900 mb-1">{review.title}</div>
                      <p className="text-xs text-slate-600 line-clamp-2">{review.text}</p>
                      <p className="text-[10px] text-slate-400 mt-2">By {review.user?.name || 'Unknown'} on {new Date(review.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right align-top">
                      <button 
                        onClick={() => handleDelete(review._id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
