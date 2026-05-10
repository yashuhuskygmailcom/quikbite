import React, { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="section-title">Order History</h1>
          <p className="page-subtitle">{orders.length} orders placed</p>
        </div>
        <button
          className="add-btn"
          style={{ marginTop: 6 }}
          onClick={fetchOrders}
        >
          ↻ Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No orders yet. Go place your first order!</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-customer">👤 {order.customerName}</div>
                  <div className="order-time">{formatTime(order.orderedAt)}</div>
                </div>
                <span className={`status-badge ${order.status}`}>{order.status}</span>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <span key={idx} className="order-item-tag">
                    {item.emoji} {item.name} × {item.quantity}
                  </span>
                ))}
              </div>

              <div className="order-footer">
                <span className="order-total">₹{order.totalAmount}</span>
                <span className="order-id">#{order._id.toString().slice(-8).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
