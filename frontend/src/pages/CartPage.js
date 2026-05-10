import React, { useState } from 'react';

export default function CartPage({ cart, addToCart, removeFromCart, clearCart, goToOrders }) {
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const placeOrder = async () => {
    if (!customerName.trim()) return showToast('Please enter your name', 'error');
    if (cart.length === 0) return showToast('Your cart is empty', 'error');

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          items: cart.map(i => ({ menuItemId: i._id, quantity: i.quantity }))
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Order failed');
      }

      clearCart();
      setCustomerName('');
      showToast('Order placed successfully!');
      setTimeout(() => goToOrders(), 1500);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="section-title">Your Cart</h1>
        <p className="page-subtitle">{cart.length === 0 ? 'Nothing here yet' : `${cart.reduce((s, i) => s + i.quantity, 0)} items`}</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <p>Your cart is empty. Go add some delicious food!</p>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <span className="cart-item-emoji">{item.emoji}</span>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} × {item.quantity}</div>
                </div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => removeFromCart(item._id)}>−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => addToCart(item)}>+</button>
                </div>
                <span className="cart-item-total">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="summary-card">
            <div className="summary-title">Order Summary</div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <input
              className="name-input"
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && placeOrder()}
            />
            <button
              className="place-order-btn"
              onClick={placeOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `Place Order · ₹${total}`}
            </button>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
