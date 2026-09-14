export default function MenuCard({ recipe, quantity, onChange }) {
  return (
    <div className="menu-card">
      <div className="menu-card-body">
        <h3>{recipe.name}</h3>
        <p className="menu-card-desc">{recipe.description}</p>
        <p className="menu-card-price">₹{Number(recipe.price).toFixed(2)}</p>
      </div>
      <div className="stepper">
        <button
          type="button"
          aria-label={`Remove one ${recipe.name}`}
          onClick={() => onChange(quantity - 1)}
          disabled={quantity === 0}
        >
          −
        </button>
        <span aria-live="polite">{quantity}</span>
        <button
          type="button"
          aria-label={`Add one ${recipe.name}`}
          onClick={() => onChange(quantity + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
