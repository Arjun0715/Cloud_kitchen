import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { sendOrderAlert } from "../sms.js";

export const ordersRouter = Router();

const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

// Public: a customer places an order.
// Body: { customer_name, customer_phone, delivery_address, notes, items: [{ recipe_id, quantity }] }
ordersRouter.post("/", async (req, res) => {
  const {
    customer_name,
    customer_phone,
    delivery_address,
    notes = "",
    items,
  } = req.body;

  if (!customer_name || !customer_phone || !delivery_address) {
    return res.status(400).json({
      error: "customer_name, customer_phone, and delivery_address are required.",
    });
  }
  if (!PHONE_RE.test(customer_phone)) {
    return res.status(400).json({ error: "That phone number doesn't look valid." });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Add at least one item to the order." });
  }
  for (const item of items) {
    if (!item.recipe_id || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return res
        .status(400)
        .json({ error: "Each item needs a recipe_id and a quantity of at least 1." });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Look up current prices/names server-side — never trust prices from the client.
    const recipeIds = items.map((i) => i.recipe_id);
    const { rows: recipes } = await client.query(
      "SELECT id, name, price FROM recipes WHERE id = ANY($1) AND is_available = true",
      [recipeIds]
    );
    const recipeById = new Map(recipes.map((r) => [r.id, r]));

    const missing = recipeIds.filter((id) => !recipeById.has(id));
    if (missing.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: `These items are no longer available: ${missing.join(", ")}`,
      });
    }

    const lineItems = items.map((item) => {
      const recipe = recipeById.get(item.recipe_id);
      const line_total = Number(recipe.price) * item.quantity;
      return {
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        unit_price: recipe.price,
        quantity: item.quantity,
        line_total,
      };
    });
    const total_amount = lineItems.reduce((sum, li) => sum + li.line_total, 0);

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (customer_name, customer_phone, delivery_address, notes, total_amount)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer_name, customer_phone, delivery_address, notes, total_amount]
    );
    const order = orderRows[0];

    for (const li of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, recipe_id, recipe_name, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, li.recipe_id, li.recipe_name, li.unit_price, li.quantity, li.line_total]
      );
    }

    await client.query("COMMIT");

    // Send the SMS after commit, so a Twilio hiccup never loses a saved order.
    const smsSent = await sendOrderAlert(order, lineItems);
    if (smsSent) {
      await pool.query("UPDATE orders SET sms_sent = true WHERE id = $1", [order.id]);
    }

    res.status(201).json({ ...order, sms_sent: smsSent, items: lineItems });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not place the order. Please try again." });
  } finally {
    client.release();
  }
});

// Admin: list orders, most recent first.
ordersRouter.get("/", requireAdmin, async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT 200"
    );
    const { rows: items } = await pool.query(
      `SELECT * FROM order_items WHERE order_id = ANY($1)`,
      [orders.map((o) => o.id)]
    );
    const itemsByOrder = new Map();
    for (const item of items) {
      if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
      itemsByOrder.get(item.order_id).push(item);
    }
    res.json(orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) || [] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load orders." });
  }
});

// Admin: update an order's status (received -> preparing -> out_for_delivery -> delivered / cancelled).
ordersRouter.patch("/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ["received", "preparing", "out_for_delivery", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
  }
  try {
    const { rows } = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Order not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update the order." });
  }
});
