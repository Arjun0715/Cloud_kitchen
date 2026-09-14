import { useEffect, useState } from "react";
import { api } from "../api.js";

const emptyForm = { name: "", description: "", price: "", category: "Main" };

export default function AdminMenu({ password }) {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  function load() {
    api.getMenu(true).then(setRecipes).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        await api.updateRecipe(editingId, payload, password);
      } else {
        await api.addRecipe(payload, password);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  function startEdit(recipe) {
    setEditingId(recipe.id);
    setForm({
      name: recipe.name,
      description: recipe.description,
      price: recipe.price,
      category: recipe.category,
    });
  }

  async function toggleAvailable(recipe) {
    try {
      await api.updateRecipe(recipe.id, { is_available: !recipe.is_available }, password);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(id) {
    if (!confirm("Remove this dish from the menu?")) return;
    try {
      await api.deleteRecipe(id, password);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="admin-menu">
      <form className="recipe-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit dish" : "Add a dish"}</h2>
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Description
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <div className="form-row">
          <label>
            Price (₹)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label>
            Category
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Main, Dessert, Drinks…"
            />
          </label>
        </div>
        {error && <p className="error-banner">{error}</p>}
        <div className="form-actions">
          <button className="btn-primary" type="submit">
            {editingId ? "Save changes" : "Add dish"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="recipe-manage-list">
        {recipes.map((recipe) => (
          <div key={recipe.id} className={`recipe-manage-row ${recipe.is_available ? "" : "unavailable"}`}>
            <div>
              <strong>{recipe.name}</strong>
              <span className="recipe-manage-price"> · ₹{Number(recipe.price).toFixed(2)}</span>
              <span className="recipe-manage-category"> · {recipe.category}</span>
              {!recipe.is_available && <span className="unavailable-tag">Hidden from menu</span>}
            </div>
            <div className="recipe-manage-actions">
              <button onClick={() => toggleAvailable(recipe)}>
                {recipe.is_available ? "Hide" : "Show"}
              </button>
              <button onClick={() => startEdit(recipe)}>Edit</button>
              <button onClick={() => remove(recipe.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
