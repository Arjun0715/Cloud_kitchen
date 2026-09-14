// Runs database/schema.sql against DATABASE_URL. Safe to re-run — everything
// uses CREATE TABLE IF NOT EXISTS and the seed data only inserts when the
// recipes table is empty.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { pool } from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "..", "database", "schema.sql");

async function main() {
  const sql = readFileSync(schemaPath, "utf8");
  console.log("Applying schema.sql to the database...");
  await pool.query(sql);
  console.log(sql);
  console.log("Done. Tables are ready and starter menu items are seeded (if the table was empty).");
  await pool.end();
}

main().catch((err) => {
  console.error("Failed to set up the database:", err.message);
  process.exit(1);
});
