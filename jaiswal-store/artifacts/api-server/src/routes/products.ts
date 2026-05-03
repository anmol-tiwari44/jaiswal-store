import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function computeProduct(p: typeof productsTable.$inferSelect) {
  const discount = p.discount ?? 0;
  const finalPrice = Math.max(0, p.price - discount);
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    discount,
    imageUrl: p.imageUrl ?? null,
    finalPrice: Math.round(finalPrice * 100) / 100,
    savings: Math.round(discount * 100) / 100,
  };
}

// GET /api/products
router.get("/products", async (req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.id);
  res.json(products.map(computeProduct));
});

// GET /api/products/stats
router.get("/products/stats", async (req, res) => {
  const products = await db.select().from(productsTable);
  const totalProducts = products.length;
  const onDiscount = products.filter((p) => (p.discount ?? 0) > 0).length;
  const discounts = products.filter((p) => (p.discount ?? 0) > 0).map((p) => p.discount ?? 0);
  const avgDiscount = discounts.length ? discounts.reduce((a, b) => a + b, 0) / discounts.length : 0;
  const prices = products.map((p) => p.price);
  res.json({
    totalProducts,
    onDiscount,
    avgDiscount: Math.round(avgDiscount * 10) / 10,
    lowestPrice: prices.length ? Math.min(...prices) : null,
    highestPrice: prices.length ? Math.max(...prices) : null,
  });
});

// GET /api/products/:id
router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(computeProduct(product));
});

const createProductBodySchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  discount: z.number().min(0).default(0),
  imageUrl: z.string().nullable().optional(),
});

// POST /api/products (admin only)
router.post("/products", async (req, res) => {
  const session = (req as any).session;
  if (!session?.admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = createProductBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { name, price, discount, imageUrl } = parsed.data;
  const [product] = await db
    .insert(productsTable)
    .values({ name, price, discount: discount ?? 0, imageUrl: imageUrl ?? null })
    .returning();
  res.status(201).json(computeProduct(product));
});

const updateProductBodySchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  discount: z.number().min(0).default(0),
  imageUrl: z.string().nullable().optional(),
});

// PUT /api/products/:id (admin only)
router.put("/products/:id", async (req, res) => {
  const session = (req as any).session;
  if (!session?.admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = updateProductBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { name, price, discount, imageUrl } = parsed.data;
  const [updated] = await db
    .update(productsTable)
    .set({ name, price, discount: discount ?? 0, imageUrl: imageUrl ?? null })
    .where(eq(productsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(computeProduct(updated));
});

// DELETE /api/products/:id (admin only)
router.delete("/products/:id", async (req, res) => {
  const session = (req as any).session;
  if (!session?.admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).send();
});

export default router;
