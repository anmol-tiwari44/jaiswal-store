/**
 * Run this ONCE after deploying to set up the database.
 * Usage: node scripts/setup-db.mjs
 *
 * Make sure DATABASE_URL is set in your environment first.
 */

import pg from "pg";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function setup() {
  await client.connect();
  console.log("Connected to database.");

  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      discount NUMERIC(10,2) NOT NULL DEFAULT 0,
      image_url TEXT
    )
  `);
  console.log("Created products table.");

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `);
  console.log("Created users table.");

  await client.query(`
    CREATE TABLE IF NOT EXISTS shop (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Jaiswal Store',
      phone TEXT,
      address TEXT
    )
  `);
  console.log("Created shop table.");

  const { rows: users } = await client.query("SELECT id FROM users LIMIT 1");
  if (users.length === 0) {
    const hash = await bcrypt.hash("admin123", 10);
    await client.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      ["admin", hash]
    );
    console.log("Created admin user: username=admin  password=admin123");
    console.log("IMPORTANT: Change your password after first login!");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const { rows: shop } = await client.query("SELECT id FROM shop LIMIT 1");
  if (shop.length === 0) {
    await client.query(
      "INSERT INTO shop (name, phone, address) VALUES ($1, $2, $3)",
      ["Jaiswal Store", null, null]
    );
    console.log("Created shop record.");
  } else {
    console.log("Shop record already exists, skipping.");
  }

  await client.end();
  console.log("\nDatabase setup complete!");
}

setup().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
