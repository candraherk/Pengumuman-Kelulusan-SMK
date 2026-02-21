import { db } from "./db";
import {
  admins, students, settings,
  type Admin, type InsertAdmin,
  type Student, type InsertStudent,
  type Setting, type InsertSetting
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByNis(nis: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<void>;
  
  getSettings(): Promise<Setting | undefined>;
  updateSettings(settingsData: InsertSetting): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }
  
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByNis(nis: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.nis, nis));
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db.update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning();
    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getSettings(): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(settingsData: InsertSetting): Promise<Setting> {
    const [existing] = await db.select().from(settings).limit(1);
    if (existing) {
      const [updated] = await db.update(settings).set(settingsData).where(eq(settings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(settingsData).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
