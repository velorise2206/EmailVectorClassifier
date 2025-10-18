// Blueprint reference: javascript_database
import {
  categories,
  emails,
  classifications,
  type Category,
  type InsertCategory,
  type Email,
  type InsertEmail,
  type Classification,
  type InsertClassification,
  type EmailWithClassification,
  type CategoryWithStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: InsertCategory): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;
  getCategoriesWithStats(): Promise<CategoryWithStats[]>;

  // Emails
  getEmails(filters?: { categoryId?: string; search?: string }): Promise<EmailWithClassification[]>;
  getEmailById(id: string): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: string, email: Partial<InsertEmail>): Promise<Email | undefined>;
  getEmailByGmailId(gmailId: string): Promise<Email | undefined>;
  getEmailsWithEmbeddings(): Promise<Email[]>;

  // Classifications
  createClassification(classification: InsertClassification): Promise<Classification>;
  getClassificationByEmailId(emailId: string): Promise<Classification | undefined>;
  updateClassification(emailId: string, classification: Partial<InsertClassification>): Promise<void>;

  // Stats
  getStats(): Promise<{
    totalEmails: number;
    categorizedEmails: number;
    totalCategories: number;
    averageConfidence: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: string, insertCategory: InsertCategory): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(insertCategory)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getCategoriesWithStats(): Promise<CategoryWithStats[]> {
    const totalEmailsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(emails);
    const totalEmails = Number(totalEmailsResult[0]?.count || 0);

    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        color: categories.color,
        icon: categories.icon,
        createdAt: categories.createdAt,
        emailCount: sql<number>`count(${classifications.id})`,
      })
      .from(categories)
      .leftJoin(classifications, eq(categories.id, classifications.categoryId))
      .groupBy(categories.id)
      .orderBy(categories.name);

    return categoriesData.map((cat) => ({
      ...cat,
      emailCount: Number(cat.emailCount),
      percentage: totalEmails > 0 ? (Number(cat.emailCount) / totalEmails) * 100 : 0,
    }));
  }

  // Emails
  async getEmails(filters?: { categoryId?: string; search?: string }): Promise<EmailWithClassification[]> {
    let query = db
      .select({
        email: emails,
        classification: classifications,
        category: categories,
      })
      .from(emails)
      .leftJoin(classifications, eq(emails.id, classifications.emailId))
      .leftJoin(categories, eq(classifications.categoryId, categories.id))
      .orderBy(desc(emails.receivedAt))
      .$dynamic();

    if (filters?.categoryId && filters.categoryId !== "all") {
      query = query.where(eq(classifications.categoryId, filters.categoryId));
    }

    const results = await query;

    return results.map((row) => ({
      ...row.email,
      classification: row.classification && row.category ? {
        ...row.classification,
        category: row.category,
      } : undefined,
    }));
  }

  async getEmailById(id: string): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email || undefined;
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const [email] = await db.insert(emails).values(insertEmail).returning();
    return email;
  }

  async updateEmail(id: string, updateData: Partial<InsertEmail>): Promise<Email | undefined> {
    const [email] = await db
      .update(emails)
      .set(updateData)
      .where(eq(emails.id, id))
      .returning();
    return email || undefined;
  }

  async getEmailByGmailId(gmailId: string): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.gmailId, gmailId));
    return email || undefined;
  }

  async getEmailsWithEmbeddings(): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .where(sql`${emails.embedding} IS NOT NULL`);
  }

  // Classifications
  async createClassification(insertClassification: InsertClassification): Promise<Classification> {
    const [classification] = await db
      .insert(classifications)
      .values(insertClassification)
      .returning();
    return classification;
  }

  async getClassificationByEmailId(emailId: string): Promise<Classification | undefined> {
    const [classification] = await db
      .select()
      .from(classifications)
      .where(eq(classifications.emailId, emailId));
    return classification || undefined;
  }

  async updateClassification(emailId: string, updateData: Partial<InsertClassification>): Promise<void> {
    await db
      .update(classifications)
      .set(updateData)
      .where(eq(classifications.emailId, emailId));
  }

  // Stats
  async getStats(): Promise<{
    totalEmails: number;
    categorizedEmails: number;
    totalCategories: number;
    averageConfidence: number;
  }> {
    const [emailCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emails);

    const [categorizedCount] = await db
      .select({ count: sql<number>`count(distinct ${classifications.emailId})` })
      .from(classifications);

    const [categoryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories);

    const [avgConfidence] = await db
      .select({ avg: sql<number>`avg(${classifications.confidence})` })
      .from(classifications);

    return {
      totalEmails: Number(emailCount?.count || 0),
      categorizedEmails: Number(categorizedCount?.count || 0),
      totalCategories: Number(categoryCount?.count || 0),
      averageConfidence: Number(avgConfidence?.avg || 0),
    };
  }
}

export const storage = new DatabaseStorage();
