import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

// GET /api/auth/me
router.get("/auth/me", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  const session = (req as any).session;
  res.json({
    isAdmin: !!(session?.admin),
    username: session?.username ?? null,
  });
});

const loginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { username, password } = parsed.data;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  const session = (req as any).session;
  session.admin = true;
  session.username = user.username;
  session.userId = user.id;
  res.json({ username: user.username, message: "Welcome back!" });
});

// POST /api/auth/logout
router.post("/auth/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

const changeCredentialsBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

// POST /api/auth/change-credentials (admin only)
router.post("/auth/change-credentials", async (req, res) => {
  const session = (req as any).session;
  if (!session?.admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = changeCredentialsBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { username, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = session.userId;
  const sessionUsername = session.username;
  if (userId) {
    await db
      .update(usersTable)
      .set({ username, passwordHash })
      .where(eq(usersTable.id, userId));
  } else if (sessionUsername) {
    await db
      .update(usersTable)
      .set({ username, passwordHash })
      .where(eq(usersTable.username, sessionUsername));
  } else {
    res.status(400).json({ error: "Session missing user info" });
    return;
  }
  session.destroy(() => {
    res.json({ message: "Credentials updated" });
  });
});

export default router;
