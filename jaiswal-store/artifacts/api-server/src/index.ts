import app from "./app";
import { logger } from "./lib/logger";
import { pool, db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

async function setupDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      );
     DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  discount REAL NOT NULL DEFAULT 0,
  image_url TEXT
);
    `);
    const users = await db.select().from(usersTable).limit(1);
    if (users.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await db.insert(usersTable).values({ username: "admin", passwordHash: hash });
      logger.info("Admin user created: username=admin password=admin123");
    }
  } catch (err) {
    logger.error({ err }, "Database setup failed");
  }
}

const rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

setupDatabase().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
});
