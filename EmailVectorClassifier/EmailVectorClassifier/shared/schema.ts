import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Categories for email classification
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").notNull(), // Hex color code
  icon: text("icon").notNull(), // Icon name from lucide-react
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Emails fetched from Gmail
export const emails = pgTable("emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gmailId: text("gmail_id").notNull().unique(), // Gmail message ID
  subject: text("subject").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  body: text("body"), // Email body content
  snippet: text("snippet"), // Short preview
  receivedAt: timestamp("received_at").notNull(),
  embedding: real("embedding").array(), // Vector embedding from OpenAI
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Classifications linking emails to categories
export const classifications = pgTable("classifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  emailId: varchar("email_id").notNull().references(() => emails.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  confidence: real("confidence").notNull(), // 0-1 confidence score
  isManual: integer("is_manual").notNull().default(0), // 0 = auto, 1 = manual override
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  classifications: many(classifications),
}));

export const emailsRelations = relations(emails, ({ many }) => ({
  classifications: many(classifications),
}));

export const classificationsRelations = relations(classifications, ({ one }) => ({
  email: one(emails, {
    fields: [classifications.emailId],
    references: [emails.id],
  }),
  category: one(categories, {
    fields: [classifications.categoryId],
    references: [categories.id],
  }),
}));

// Zod schemas for validation
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  createdAt: true,
});

export const insertClassificationSchema = createInsertSchema(classifications).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;

export type Classification = typeof classifications.$inferSelect;
export type InsertClassification = z.infer<typeof insertClassificationSchema>;

// Extended types for API responses with relations
export type EmailWithClassification = Email & {
  classification?: Classification & {
    category: Category;
  };
};

export type CategoryWithStats = Category & {
  emailCount: number;
  percentage: number;
};

// Similarity result type
export type SimilarEmail = {
  email: Email;
  similarity: number;
};
