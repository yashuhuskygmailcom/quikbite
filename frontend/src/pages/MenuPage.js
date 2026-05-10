import React, { useEffect, useState } from 'react';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];
const CAT_ICONS = { All: '🍽️', Starters: '🥗', Mains: '🍛', Desserts: '🍮', Drinks: '🥤' };

export default function MenuPage({ cart, addToCart, removeFromCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => { setMenuItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const getCartQty = (id) => {
    const found = cart.find(c => c._id === id);
    return found ? found.quantity : 0;
  };

  if (loading) return <div className="loading">Loading menu...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="section-title">Our Menu</h1>
        <p className="page-subtitle">{menuItems.length} items across {CATEGORIES.length - 1} categories</p>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CAT_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filtered.map(item => {
          const qty = getCartQty(item._id);
          const isLowStock = item.stock > 0 && item.stock <= 5;
          return (
            <div key={item._id} className={`menu-card ${!item.available ? 'unavailable' : ''}`}>
              <div className="menu-card-header">
                <span className="menu-emoji">{item.emoji}</span>
                <span className="menu-price">₹{item.price}</span>
              </div>
              <div className="menu-name">{item.name}</div>
              <div className="menu-desc">{item.description}</div>
              <div className="menu-footer">
                <span className={`stock-tag ${isLowStock ? 'low' : ''}`}>
                  {item.available ? `${item.stock} left` : 'Out of stock'}
                </span>
                {!item.available ? (
                  <span className="unavail-badge">Unavailable</span>
                ) : qty === 0 ? (
                  <button className="add-btn" onClick={() => addToCart(item)}>+ Add</button>
                ) : (
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => removeFromCart(item._id)}>−</button>
                    <span className="qty-num">{qty}</span>
                    <button className="qty-btn" onClick={() => addToCart(item)}>+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
