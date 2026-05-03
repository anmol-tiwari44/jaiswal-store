import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shopTable = pgTable("shop", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
});

export const insertShopSchema = createInsertSchema(shopTable).omit({ id: true });
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shopTable.$inferSelect;
