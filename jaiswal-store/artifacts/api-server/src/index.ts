import app from "./app";
import { logger } from "./lib/logger";
import pg from "pg";
import bcrypt from "bcrypt";

async function setupDatabase() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
      );
    `);
    const { rows } = await client.query("SELECT id FROM users LIMIT 1");
    if (rows.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await client.query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
        ["admin", hash]
      );
      logger.info("Admin user created: username=admin password=admin123");
    }
  } catch (err) {
    logger.error({ err }, "Database setup failed");
  } finally {
    await client.end();
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
