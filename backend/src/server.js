import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { recipesRouter } from "./routes/recipes.js";
import { ordersRouter } from "./routes/orders.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://cloud-kitchen-h4q3fbso5-arjun-3754.vercel.app",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/recipes", recipesRouter);
app.use("/api/orders", ordersRouter);

app.use((req, res) => res.status(404).json({ error: "Not found." }));

app.listen(PORT, () => {
  console.log(`Cloud kitchen backend running on http://localhost:${PORT}`);
});
