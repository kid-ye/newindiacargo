import { useState, useEffect } from "react";
import "./Dashboard.css";
import CallbackForm from "./components/CallbackForm";
import { authFetch } from "./api";
import { statusClass } from "./utils";
import { SHIPPING_RATES, ORDER_STATUSES } from "./config";
import ShippingModeSelector from "./components/ShippingModeSelector";
import { Package, Map as MapIcon, Clock, User, Phone, Menu, CheckCircle, MapPin } from "lucide-react";

const NAV = [
  { key: "new-order", label: "New Order", icon: <Package size={18} /> },
  { key: "track", label: "Track Orders", icon: <MapIcon size={18} /> },
  { key: "history", label: "Order History", icon: <Clock size={18} /> },
  { key: "account", label: "Account", icon: <User size={18} /> },
  { key: "contact", label: "Contact", icon: <Phone size={18} /> },
];

export default function Dashboard({ user, onLogout }) {
  const [active, setActive] = useState("new-order");
  const [orders, setOrders] = useState([]);
  const [shipMode, setShipMode] = useState("train");
  const [estimate, setEstimate] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (active === "history" || active === "track") fetchOrders();
  }, [active]);

  const fetchOrders = async () => {
    const res = await authFetch("/api/orders");
    const data = await res.json();
    if (data.orders) setOrders(data.orders);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const f = e.target;
    const weight = parseFloat(f.weight.value);
    const mode = shipMode;
    const total = SHIPPING_RATES[mode] * weight;
    const body = {
      pickup: f.pickup.value,
      dropoff: f.dropoff.value,
      mode,
      weight,
      total,
    };
    const res = await authFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setEstimate({ ...body, total: total.toFixed(2) });
      setOrderPlaced(true);
      f.reset();
      setShipMode("train");
      fetchOrders();
    } else {
      const err = await res.json();
      setOrderError(err.error || "Unknown error");
    }
  };

  return (
    <div className="dash-shell">
      <button className="dash-menu-toggle" onClick={() => setSidebarOpen((o) => !o)}>
        <Menu size={24} />
      </button>

      <aside className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="dash-brand">New India Cargo</div>
        <nav className="dash-nav">
          {NAV.map((n) => (
            <button
              key={n.key}
              className={`dash-nav-item${active === n.key ? " active" : ""}`}
              onClick={() => {
                setActive(n.key);
                setSidebarOpen(false);
                setOrderPlaced(false);
                setEstimate(null);
              }}
            >
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <button className="dash-logout" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="dash-main">
        {/* NEW ORDER */}
        {active === "new-order" && (
          <div className="dash-section">
            <h2>New Order</h2>
            {orderPlaced ? (
              <div className="dash-success">
                <div className="dash-success-icon"><CheckCircle size={48} color="#16a34a" /></div>
                <h3>Order Placed!</h3>
                <p>
                  {estimate.pickup} → {estimate.dropoff}
                </p>
                <p>
                  <strong>₹{estimate.total}</strong> · {estimate.weight}kg ·{" "}
                  {estimate.mode}
                </p>
                <button
                  className="dash-btn"
                  onClick={() => {
                    setOrderPlaced(false);
                    setEstimate(null);
                    setOrderError("");
                  }}
                >
                  Place Another
                </button>
              </div>
            ) : (
              <form className="dash-form" onSubmit={handlePlaceOrder}>
                <label>Pickup Location</label>
                <input name="pickup" placeholder="e.g. Mumbai" required />
                <label>Drop-off Location</label>
                <input name="dropoff" placeholder="e.g. Delhi" required />
                <label>Shipping Mode</label>
                <ShippingModeSelector
                  shipMode={shipMode}
                  setShipMode={setShipMode}
                />
                <label>Weight (kg)</label>
                <input
                  name="weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 5"
                  required
                />
                {orderError && <p className="dash-error">{orderError}</p>}
                <button type="submit" className="dash-btn">
                  Place Order
                </button>
              </form>
            )}
          </div>
        )}

        {/* TRACK ORDERS */}
        {active === "track" && (
          <div className="dash-section">
            <h2>Track Orders</h2>
            {orders.length === 0 ? (
              <p className="dash-empty">No orders yet.</p>
            ) : (
              <div className="dash-track-list">
                {orders.map((order) => (
                  <div key={order.id} className="dash-track-card">
                    <div className="dash-track-header">
                      <span className="dash-order-id">Order #{order.id}</span>
                      <span className={statusClass(order.status)}>
                        {order.status}
                      </span>
                    </div>
                    <div className="dash-track-route">
                      {order.pickup} → {order.dropoff}
                    </div>
                    <div className="dash-track-meta">
                      {order.mode} · {order.weight}kg · ₹{order.total}
                    </div>
                    {order.location && (
                      <div className="dash-track-location"><MapPin size={16} className="dash-track-pin" /> Current location: <strong>{order.location}</strong>
                      </div>
                    )}
                    <div className="dash-track-timeline">
                      {ORDER_STATUSES.map((step, i) => {
                        const current = ORDER_STATUSES.indexOf(order.status);
                        const done = i <= current;
                        return (
                          <div
                            key={step}
                            className={`dash-step${done ? " done" : ""}`}
                          >
                            <div className="dash-step-dot" />
                            <span>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        {active === "history" && (
          <div className="dash-section">
            <h2>Order History</h2>
            {orders.length === 0 ? (
              <p className="dash-empty">No orders yet.</p>
            ) : (
              <div className="dash-history-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Pickup</th>
                      <th>Drop-off</th>
                      <th>Mode</th>
                      <th>Weight</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.pickup}</td>
                        <td>{o.dropoff}</td>
                        <td style={{ textTransform: "capitalize" }}>
                          {o.mode}
                        </td>
                        <td>{o.weight}kg</td>
                        <td>₹{o.total}</td>
                        <td>
                          <span className={statusClass(o.status)}>
                            {o.status}
                          </span>
                        </td>
                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT */}
        {active === "account" && (
          <div className="dash-section">
            <h2>Account</h2>
            <div className="dash-account-card">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="dash-avatar"
                />
              ) : (
                <div className="dash-avatar-placeholder">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="dash-account-info">
                <div className="dash-account-name">{user.name}</div>
                <div className="dash-account-email">{user.email}</div>
                <div className="dash-account-role">{user.role}</div>
              </div>
            </div>
          </div>
        )}

        {active === "contact" && (
          <div className="dash-section">
            <h2>Contact Us</h2>
            <CallbackForm
              formClassName="dash-form"
              btnClassName="dash-btn"
              errorClassName="dash-error"
              successContent={
                <div className="dash-success">
                  <div className="dash-success-icon"><CheckCircle size={48} color="#16a34a" /></div>
                  <h3>Message Sent!</h3>
                  <p>We'll get back to you soon.</p>
                </div>
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
