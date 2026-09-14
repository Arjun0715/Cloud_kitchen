// import pg from "pg";
// import dotenv from "dotenv";

// dotenv.config();


// const { Pool } = pg;


// if (!process.env.DATABASE_URL) {
//   console.error(
//     "Missing DATABASE_URL. Copy backend/.env.example to backend/.env and fill it in."
//   );
// }

// export const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
// });

// pool.on("error", (err) => {
//   // A background/idle client failed — log it, don't crash the whole server.
//   console.error("Unexpected Postgres client error:", err);
// });
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres client error:", err);
});