import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const MemStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "smkn2godean-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemStore({ checkPeriod: 86400000 }),
    })
  );

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const admin = await storage.getAdminByEmail(email);
        if (!admin || !(await comparePasswords(password, admin.password))) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, admin);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));

  passport.deserializeUser(async (id: number, done) => {
    try {
      const { db } = await import("./db");
      const { admins } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const [admin] = await db.select().from(admins).where(eq(admins.id, id));
      done(null, admin);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json({ message: "Logged in successfully" });
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as any;
    res.json({ id: user.id, email: user.email });
  });

  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Not authenticated" });
  };

  // Public routes
  app.get(api.public.settings.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json({
      announcementDate: settings?.announcementDate?.toISOString() || null,
      isOpen: settings?.isOpen || false
    });
  });

  app.post(api.public.check.path, async (req, res) => {
    try {
      const input = api.public.check.input.parse(req.body);
      const settings = await storage.getSettings();
      
      if (!settings?.isOpen) {
        return res.status(403).json({ message: "Pengumuman belum dibuka" });
      }

      const student = await storage.getStudentByNis(input.nis);
      if (!student) {
        return res.status(404).json({ message: "Data siswa tidak ditemukan / Tanggal lahir salah" });
      }

      if (student.birthDate !== input.birthDate) {
        return res.status(404).json({ message: "Data siswa tidak ditemukan / Tanggal lahir salah" });
      }

      res.json({
        name: student.name,
        major: student.major,
        status: student.status,
        notes: student.notes,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input format" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Admin routes
  app.get(api.admin.students.list.path, requireAuth, async (req, res) => {
    const students = await storage.getStudents();
    res.json(students);
  });

  app.post(api.admin.students.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.admin.students.create.input.parse(req.body);
      const student = await storage.createStudent(input);
      res.status(201).json(student);
    } catch (err) {
      res.status(400).json({ message: "Gagal menambahkan siswa (NIS mungkin duplikat)" });
    }
  });

  app.put(api.admin.students.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.admin.students.update.input.parse(req.body);
      const student = await storage.updateStudent(Number(req.params.id), input);
      if (!student) return res.status(404).json({ message: "Siswa tidak ditemukan" });
      res.json(student);
    } catch (err) {
      res.status(400).json({ message: "Gagal mengubah data siswa" });
    }
  });

  app.delete(api.admin.students.delete.path, requireAuth, async (req, res) => {
    await storage.deleteStudent(Number(req.params.id));
    res.status(204).end();
  });

  app.post(api.admin.students.import.path, requireAuth, async (req, res) => {
    try {
      const { students } = api.admin.students.import.input.parse(req.body);
      let count = 0;
      for (const student of students) {
        try {
          await storage.createStudent(student);
          count++;
        } catch (e) {
          // ignore duplicates
        }
      }
      res.status(201).json({ count });
    } catch (err) {
      res.status(400).json({ message: "Invalid import format" });
    }
  });

  app.put(api.admin.settings.update.path, requireAuth, async (req, res) => {
    try {
      console.log("Updating settings with body:", req.body);
      
      // Explicitly parse using the updated schema that handles string-to-date conversion
      const input = insertSettingsSchema.parse(req.body);

      const settings = await storage.updateSettings(input);
      console.log("Settings updated successfully:", settings);
      res.json(settings);
    } catch (err) {
      console.error("Error updating settings:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Format tidak valid: " + err.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ") 
        });
      } else {
        res.status(500).json({ message: "Gagal memperbarui pengaturan" });
      }
    }
  });

  // Setup seed data
  async function seedDatabase() {
    try {
      // Check settings
      const currentSettings = await storage.getSettings();
      if (!currentSettings) {
        await storage.updateSettings({
          announcementDate: new Date(Date.now() + 86400000), // tomorrow
          isOpen: true,
        });
      }

      // Check admin
      const admin = await storage.getAdminByEmail("admin@smkn2godean.sch.id");
      if (!admin) {
        const hashedPassword = await hashPassword("admin123");
        await storage.createAdmin({
          email: "admin@smkn2godean.sch.id",
          password: hashedPassword,
        });
      }

      // Check students
      const studentsList = await storage.getStudents();
      if (studentsList.length === 0) {
        await storage.createStudent({
          nis: "12345",
          name: "Budi Santoso",
          major: "Teknik Komputer dan Jaringan",
          birthDate: "2006-05-15",
          status: "LULUS",
          notes: "Selamat, tingkatkan terus prestasimu!",
        });
        await storage.createStudent({
          nis: "12346",
          name: "Siti Aminah",
          major: "Rekayasa Perangkat Lunak",
          birthDate: "2006-08-20",
          status: "TIDAK LULUS",
          notes: "Jangan menyerah, tetap semangat belajar!",
        });
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }

  // Seed on startup
  seedDatabase().catch(console.error);

  return httpServer;
}
