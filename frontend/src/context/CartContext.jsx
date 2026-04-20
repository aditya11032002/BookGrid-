import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import logger from '../utils/logger';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (book) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === book._id);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item._id === book._id ? { ...item, qty: item.qty + 1 } : item
        );
        logger.logCartAction('add', book, { items: newCart, total: newCart.reduce((sum, item) => sum + item.price * item.qty, 0) });
      } else {
        newCart = [...prev, { ...book, qty: 1 }];
        logger.logCartAction('add', book, { items: newCart, total: newCart.reduce((sum, item) => sum + item.price * item.qty, 0) });
      }
      return newCart;
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const item = prev.find((item) => item._id === id);
      const newCart = prev.filter((item) => item._id !== id);
      if (item) {
        logger.logCartAction('remove', item, { items: newCart, total: newCart.reduce((sum, item) => sum + item.price * item.qty, 0) });
      }
      return newCart;
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCartItems((prev) => {
      const newCart = prev.map((item) => (item._id === id ? { ...item, qty } : item));
      const item = newCart.find(item => item._id === id);
      if (item) {
        logger.logCartAction('update', item, { items: newCart, total: newCart.reduce((sum, item) => sum + item.price * item.qty, 0) });
      }
      return newCart;
    });
  };

  const clearCart = () => {
    logger.logCartAction('clear', {}, { items: [], total: 0 });
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};
