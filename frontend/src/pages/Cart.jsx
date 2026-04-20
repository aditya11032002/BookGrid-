import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQty, removeFromCart, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center flex-grow flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-5xl display-serif text-[#1a0f11] mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any books to your cart yet.</p>
          <Link to="/" className="inline-block bg-[#111217] text-white px-8 py-3 font-medium hover:bg-[#7d1c22] transition uppercase tracking-[0.12em] text-xs">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
      <h1 className="text-5xl display-serif text-[#1a0f11] mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={item._id} className="flex gap-6 py-4 border-b border-slate-200 last:border-0">
              <div className="w-24 h-32 bg-[#f3eee4] overflow-hidden flex-shrink-0 shadow-sm">
                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between">
                    <Link to={`/books/${item._id}`}>
                      <h3 className="font-semibold text-2xl display-serif text-[#1a0f11] hover:text-[#7d1c22] transition">{item.title}</h3>
                    </Link>
                    <p className="font-bold text-[#1a0f11]">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 uppercase tracking-[0.14em]">{item.author}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border border-slate-300 bg-white">
                    <button onClick={() => updateQty(item._id, item.qty - 1)} className="p-2 text-gray-500 hover:text-black transition focus:outline-none">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-medium text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)} className="p-2 text-gray-500 hover:text-black transition focus:outline-none">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="text-red-500 text-sm font-medium flex items-center hover:text-red-700 transition focus:outline-none">
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-[#fbf8f2] p-6 h-fit border border-amber-900/15">
          <h2 className="text-3xl display-serif text-[#1a0f11] mb-6">Order Summary</h2>
          <div className="space-y-4 text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between text-gray-900 font-bold text-lg">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="w-full bg-[#111217] text-white py-3.5 font-bold flex justify-center items-center hover:bg-[#7d1c22] transition focus:outline-none uppercase tracking-[0.12em] text-xs">
            Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
