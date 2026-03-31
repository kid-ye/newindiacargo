import { useState, useEffect } from 'react';
import './Dashboard.css';
import './AdminDashboard.css';
import { authFetch } from './api';
import { statusClass } from './utils';
import { ORDER_STATUSES } from './config';

export default function AdminDashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const selectOrder = (order) => {
    setSelected(order);
    setStatus(order.status);
    setLocation(order.location || '');
    setSaved(false);
  };

  const fetchOrders = async () => {
    const res = await authFetch('/api/admin/orders');
    const data = await res.json();
    if (data.orders) setOrders(data.orders);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await authFetch(`/api/admin/orders/${selected.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, location }),
    });
    setSaving(false);
    setSaved(true);
    setSelected(prev => ({ ...prev, status, location }));
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status, location } : o));
  };

  const filtered = orders.filter(o =>
    String(o.id).includes(search) ||
    o.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.pickup?.toLowerCase().includes(search.toLowerCase()) ||
    o.dropoff?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand">Admin Panel</div>
        <div className="admin-user-info">
          <div className="admin-user-name">{user.name}</div>
          <div className="admin-user-role">Administrator</div>
        </div>
        <button className="dash-logout" onClick={onLogout}>Logout</button>
      </aside>

      <main className="dash-main">
        <div className="admin-header">
          <h2>Manage Orders</h2>
          <span className="admin-count">{orders.length} total orders</span>
        </div>

        <div className="admin-layout">
          {/* Orders list */}
          <div className="admin-orders-panel">
            <input
              className="admin-search"
              placeholder="Search by ID, customer, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="admin-orders-list">
              {filtered.length === 0 && <p className="dash-empty">No orders found.</p>}
              {filtered.map(order => (
                <div
                  key={order.id}
                  className={`admin-order-row${selected?.id === order.id ? ' selected' : ''}`}
                  onClick={() => selectOrder(order)}
                >
                  <div className="admin-order-row-top">
                    <span className="admin-order-id">#{order.id}</span>
                    <span className={statusClass(order.status)}>{order.status}</span>
                  </div>
                  <div className="admin-order-route">{order.pickup} → {order.dropoff}</div>
                  <div className="admin-order-meta">{order.user_name} · {order.mode} · {order.weight}kg · ₹{order.total}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Update panel */}
          <div className="admin-update-panel">
            {!selected ? (
              <div className="admin-placeholder">
                <div className="admin-placeholder-icon">📦</div>
                <p>Select an order to update its status and location</p>
              </div>
            ) : (
              <form className="admin-update-form" onSubmit={handleUpdate}>
                <div className="admin-update-title">Order #{selected.id}</div>
                <div className="admin-update-route">{selected.pickup} → {selected.dropoff}</div>
                <div className="admin-update-customer">👤 {selected.user_name} · {selected.user_email}</div>
                <div className="admin-update-meta">{selected.mode} · {selected.weight}kg · ₹{selected.total}</div>

                <label className="admin-label">Status</label>
                <div className="admin-status-options">
                  {ORDER_STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`admin-status-btn${status === s ? ' active' : ''}`}
                      onClick={() => { setStatus(s); setSaved(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <label className="admin-label">Current Location</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Mumbai Sorting Hub"
                  value={location}
                  onChange={e => { setLocation(e.target.value); setSaved(false); }}
                />

                <button type="submit" className="dash-btn" disabled={saving}>
                  {saving ? 'Saving...' : saved ? '✓ Saved' : 'Update Order'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
