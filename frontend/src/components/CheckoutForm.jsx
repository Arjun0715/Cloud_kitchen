import { useState } from "react";

export default function CheckoutForm({ onSubmit, disabled }) {
  const [customer_name, setName] = useState("");
  const [customer_phone, setPhone] = useState("");
  const [delivery_address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ customer_name, customer_phone, delivery_address, notes });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <label>
        Your name
        <input
          required
          value={customer_name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />
      </label>
      <label>
        Phone number
        <input
          required
          type="tel"
          value={customer_phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="For delivery updates"
        />
      </label>
      <label>
        Delivery address
        <textarea
          required
          rows={2}
          value={delivery_address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="House/flat no., street, area, city, pincode"
        />
      </label>
      <label>
        Notes (optional)
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Less spicy, no onion, ring the bell twice…"
        />
      </label>

      {error && <p className="error-banner">{error}</p>}

      <button className="btn-primary" type="submit" disabled={disabled || submitting}>
        {submitting ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
