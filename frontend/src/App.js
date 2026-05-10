import React, { useState } from 'react';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import './App.css';

export default function App() {
  const [page, setPage] = useState('menu');
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === item._id);
      if (existing) {
        return prev.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c._id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c._id !== itemId);
    });
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🍽️</span>
          <span className="brand-name">QuickBite</span>
        </div>
        <div className="navbar-links">
          <button
            className={`nav-btn ${page === 'menu' ? 'active' : ''}`}
            onClick={() => setPage('menu')}
          >
            Menu
          </button>
          <button
            className={`nav-btn ${page === 'cart' ? 'active' : ''}`}
            onClick={() => setPage('cart')}
          >
            Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button
            className={`nav-btn ${page === 'orders' ? 'active' : ''}`}
            onClick={() => setPage('orders')}
          >
            Orders
          </button>
        </div>
      </nav>

      <main className="main-content">
        {page === 'menu' && (
          <MenuPage cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} />
        )}
        {page === 'cart' && (
          <CartPage
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            goToOrders={() => setPage('orders')}
          />
        )}
        {page === 'orders' && <OrdersPage />}
      </main>
    </div>
  );
}
