import { pgTable, text, serial, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  nis: text("nis").notNull().unique(),
  name: text("name").notNull(),
  major: text("major").notNull(),
  birthDate: date("birth_date").notNull(), // format YYYY-MM-DD
  status: text("status").notNull(), // "LULUS" | "TIDAK LULUS"
  notes: text("notes"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  announcementDate: timestamp("announcement_date"),
  isOpen: boolean("is_open").default(false).notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;
