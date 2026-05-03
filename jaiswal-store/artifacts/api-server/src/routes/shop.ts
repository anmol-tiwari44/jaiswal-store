import { Router } from "express";
import { db } from "@workspace/db";
import { shopTable } from "@workspace/db";
import { z } from "zod";

const router = Router();

// GET /api/shop
router.get("/shop", async (req, res) => {
  const [shop] = await db.select().from(shopTable).limit(1);
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }
  res.json(shop);
});

const updateShopBodySchema = z.object({
  name: z.string().min(1),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

// PUT /api/shop (admin only)
router.put("/shop", async (req, res) => {
  const session = (req as any).session;
  if (!session?.admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = updateShopBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { name, phone, address } = parsed.data;
  const [existing] = await db.select().from(shopTable).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }
  const [updated] = await db
    .update(shopTable)
    .set({ name, phone: phone ?? null, address: address ?? null })
    .returning();
  res.json(updated);
});

export default router;
