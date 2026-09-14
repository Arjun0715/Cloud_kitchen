import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import MenuCard from "./MenuCard.jsx";
import CheckoutForm from "./CheckoutForm.jsx";


export default function CustomerPage() {
  const [recipes, setRecipes] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [cart, setCart] = useState({}); // { [recipeId]: quantity }
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    api
      .getMenu()
      .then(setRecipes)
      .catch((err) => setLoadError(err.message));
  }, []);

  const cartLines = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const recipe = recipes.find((r) => r.id === Number(id));
        return recipe ? { recipe, quantity: qty } : null;
      })
      .filter(Boolean);
  }, [cart, recipes]);

  const total = cartLines.reduce((sum, l) => sum + l.recipe.price * l.quantity, 0);

  function setQuantity(recipeId, quantity) {
    setCart((prev) => ({ ...prev, [recipeId]: Math.max(0, quantity) }));
  }

  const categories = useMemo(() => {
    const map = new Map();
    for (const r of recipes) {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category).push(r);
    }
    return map;
  }, [recipes]);

  if (confirmedOrder) {
    return (
      <main className="page confirmation-page">
        <div className="confirmation-card">
          <h1>Order placed — thank you, {confirmedOrder.customer_name}.</h1>
          <p className="confirmation-sub">
            Order #{confirmedOrder.id} · ₹{Number(confirmedOrder.total_amount).toFixed(2)}
          </p>
          <ul className="confirmation-items">
            {confirmedOrder.items.map((item) => (
              <li key={item.recipe_name}>
                {item.quantity} × {item.recipe_name}
              </li>
            ))}
          </ul>
          <p className="confirmation-note">
            Delivering to: {confirmedOrder.delivery_address}
          </p>
          <button className="btn-primary" onClick={() => setConfirmedOrder(null)}>
            Place another order
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="hero-kicker">Cloud kitchen · delivery only</p>
       
        <h1>Unfiltered Kitchen</h1>
        <p className="hero-tagline">
          Home-style recipes, cooked to order and sent straight to your door.
        </p>
      </header>

      <div className="layout">
        <section className="menu-section" aria-label="Menu">
          {loadError && (
            <p className="error-banner">
              Couldn't load the menu ({loadError}). Server Issue!!. 
              Will Be Right Back!
            </p>
            
          )}
          {!loadError && recipes.length === 0 && (
            <p className="empty-note">No dishes are on the menu right now — check back soon.</p>
          )}
          {[...categories.entries()].map(([category, items]) => (
            <div key={category} className="menu-category">
              <h2>{category}</h2>
              <div className="menu-grid">
                {items.map((recipe) => (
                  <MenuCard
                    key={recipe.id}
                    recipe={recipe}
                    quantity={cart[recipe.id] || 0}
                    onChange={(qty) => setQuantity(recipe.id, qty)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        <aside className="cart-panel" aria-label="Your order">
          <h2>Your order</h2>
          {cartLines.length === 0 ? (
            <p className="empty-note">Add a dish to get started.</p>
          ) : (
            <>
              <ul className="cart-lines">
                {cartLines.map((line) => (
                  <li key={line.recipe.id}>
                    <span>
                      {line.quantity} × {line.recipe.name}
                    </span>
                    <span>₹{(line.recipe.price * line.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="cart-total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <CheckoutForm
                disabled={cartLines.length === 0}
                onSubmit={async (details) => {
                  const order = await api.placeOrder({
                    ...details,
                    items: cartLines.map((l) => ({
                      recipe_id: l.recipe.id,
                      quantity: l.quantity,
                    })),
                  });
                  setConfirmedOrder(order);
                  setCart({});
                }}
              />
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
