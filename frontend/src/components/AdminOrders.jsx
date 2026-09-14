import { useEffect, useState } from "react";
import { api } from "../api.js";

const STATUSES = ["received", "preparing", "out_for_delivery", "delivered", "cancelled"];
const LABELS = {
  received: "Received",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminOrders({ password }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  function load() {
    api.getOrders(password).then(setOrders).catch((e) => setError(e.message));
  }

  useEffect(load, [password]);

  async function updateStatus(id, status) {
    try {
      await api.updateOrderStatus(id, status, password);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <p className="error-banner">{error}</p>;
  if (orders.length === 0) return <p className="empty-note">No orders yet.</p>;

  return (
    <div className="orders-list">
      {orders.map((order) => (
        <article key={order.id} className="order-card">
          <div className="order-card-top">
            <div>
              <h3>
                #{order.id} · {order.customer_name}
              </h3>
              <p className="order-meta">
                {order.customer_phone} · {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <p className="order-total">₹{Number(order.total_amount).toFixed(2)}</p>
          </div>
          <p className="order-address">{order.delivery_address}</p>
          {order.notes && <p className="order-notes">Note: {order.notes}</p>}
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.quantity} × {item.recipe_name}
              </li>
            ))}
          </ul>
          <div className="order-status-row">
            <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LABELS[s]}
                </option>
              ))}
            </select>
            {!order.sms_sent && <span className="sms-warning">SMS alert didn't send</span>}
          </div>
        </article>
      ))}
    </div>
  );
}
