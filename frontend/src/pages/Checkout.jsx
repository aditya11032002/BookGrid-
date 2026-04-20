import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, CheckCircle2, ChevronRight, Lock } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    address: '', city: '', postalCode: '', country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  if (cartItems.length === 0 && step !== 4) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center mt-12 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cart is Empty</h2>
        <p className="text-slate-500 mb-6">Looks like you have nothing to checkout yet.</p>
        <Link to="/" className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-slate-800 transition">Return to Shop</Link>
      </div>
    );
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const placeOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("You must be logged in to checkout.");

      const orderItems = cartItems.map(item => ({
        book: item._id,
        title: item.title,
        qty: item.qty,
        price: item.price
      }));

      await axios.post('/api/v1/orders', {
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearCart();
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-grow">
      
      {/* Progress Wizard */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-400 -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          <div className={`flex flex-col items-center ${step >= 1 ? 'text-amber-500' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-sm ${step >= 1 ? 'bg-amber-400 text-amber-950' : 'bg-white border-2 border-slate-200'}`}>1</div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block text-slate-800">Shipping</span>
          </div>
          <div className={`flex flex-col items-center ${step >= 2 ? 'text-amber-500' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-sm ${step >= 2 ? 'bg-amber-400 text-amber-950' : 'bg-white border-2 border-slate-200'}`}>2</div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block text-slate-800">Payment</span>
          </div>
          <div className={`flex flex-col items-center ${step >= 3 ? 'text-amber-500' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-sm ${step >= 3 ? 'bg-amber-400 text-amber-950' : 'bg-white border-2 border-slate-200'}`}>3</div>
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block text-slate-800">Review</span>
          </div>
        </div>
      )}

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* STEP 1: Shipping */}
        {step === 1 && (
          <div>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <Truck className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900">Shipping Details</h2>
            </div>
            <form onSubmit={handleShippingSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Street Address</label>
                <input required type="text" value={shippingAddress.address} onChange={e => setShippingAddress({...shippingAddress, address: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none" placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">City</label>
                  <input required type="text" value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none" placeholder="New York" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Postal Code</label>
                  <input required type="text" value={shippingAddress.postalCode} onChange={e => setShippingAddress({...shippingAddress, postalCode: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none" placeholder="10001" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Country</label>
                <input required type="text" value={shippingAddress.country} onChange={e => setShippingAddress({...shippingAddress, country: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none" placeholder="United States" />
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center hover:bg-slate-800 transition">
                  Continue <ChevronRight className="ml-1 w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Payment */}
        {step === 2 && (
          <div>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              {['Credit Card', 'UPI', 'Cash on Delivery'].map((method) => (
                <label key={method} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === method ? 'border-amber-400 bg-amber-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <input type="radio" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="w-5 h-5 text-amber-500 focus:ring-amber-400" />
                  <span className="font-medium text-slate-900">{method}</span>
                </label>
              ))}
              <div className="pt-6 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="text-slate-500 font-medium hover:text-slate-900">Back</button>
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center hover:bg-slate-800 transition">
                  Review Order <ChevronRight className="ml-1 w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div>
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <Lock className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900">Review & Post Order</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Shipping To</h3>
                  <p className="text-slate-900 font-medium">{shippingAddress.address}<br/>{shippingAddress.city}, {shippingAddress.postalCode}<br/>{shippingAddress.country}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Payment Method</h3>
                  <p className="text-slate-900 font-medium">{paymentMethod}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-slate-600 line-clamp-1 pr-4">{item.qty}x {item.title}</span>
                      <span className="text-slate-900 font-medium">₹{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-green-700">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border-t border-slate-100 p-6 flex justify-between items-center">
              <button onClick={() => setStep(2)} className="text-slate-500 font-medium hover:text-slate-900">Back</button>
              <button onClick={placeOrder} disabled={loading} className="bg-amber-400 text-amber-950 px-10 py-3 rounded-xl font-bold hover:bg-amber-300 transition flex items-center justify-center w-full max-w-xs shadow-sm">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-900"></div> : "Place Order (₹" + totalPrice.toFixed(2) + ")"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Complete */}
        {step === 4 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-slate-500 mb-8 max-w-md">Thank you for your purchase. We are processing your order and will email you with updates soon.</p>
            <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
              Return Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
