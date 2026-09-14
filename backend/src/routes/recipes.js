import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const recipesRouter = Router();

// Public: list available recipes for the customer-facing menu.
recipesRouter.get("/", async (req, res) => {
  try {
    const showAll = req.query.all === "true"; // admin menu manager wants unavailable items too
    const { rows } = await pool.query(
      showAll
        ? "SELECT * FROM recipes ORDER BY category, name"
        : "SELECT * FROM recipes WHERE is_available = true ORDER BY category, name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load the menu." });
  }
});

// Admin: add a new recipe.
recipesRouter.post("/", requireAdmin, async (req, res) => {
  const { name, description = "", price, category = "Main", image_url = null } = req.body;

  if (!name || price === undefined || price === null || Number(price) < 0) {
    return res.status(400).json({ error: "name and a non-negative price are required." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO recipes (name, description, price, category, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, category, image_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add the recipe." });
  }
});

// Admin: edit a recipe (name, price, description, availability, etc).
recipesRouter.put("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, is_available, image_url } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE recipes SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         category = COALESCE($4, category),
         is_available = COALESCE($5, is_available),
         image_url = COALESCE($6, image_url),
         updated_at = now()
       WHERE id = $7 RETURNING *`,
      [name, description, price, category, is_available, image_url, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Recipe not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update the recipe." });
  }
});

// Admin: remove a recipe from the menu.
recipesRouter.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM recipes WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Recipe not found." });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete the recipe." });
  }
});
