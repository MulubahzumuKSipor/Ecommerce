import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.EXTERNAL_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase / managed Postgres
});

// Optional: log unexpected errors on idle clients
pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

export default pool;
