import { z } from "zod";
import { insertStudentSchema, insertSettingsSchema, type Student, type Setting } from "./schema";

export const api = {
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/auth/login" as const,
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: {
        200: z.object({ message: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/auth/logout" as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/auth/me" as const,
      responses: {
        200: z.object({ id: z.number(), email: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
  },
  public: {
    settings: {
      method: "GET" as const,
      path: "/api/settings" as const,
      responses: {
        200: z.object({ announcementDate: z.string().nullable(), isOpen: z.boolean() }),
      }
    },
    check: {
      method: "POST" as const,
      path: "/api/check" as const,
      input: z.object({ nis: z.string(), birthDate: z.string() }),
      responses: {
        200: z.object({
          name: z.string(),
          major: z.string(),
          status: z.string(),
          notes: z.string().nullable().optional()
        }),
        400: z.object({ message: z.string() }),
        403: z.object({ message: z.string() }), // Announcement not open
        404: z.object({ message: z.string() }), // Not found
      }
    }
  },
  admin: {
    students: {
      list: {
        method: "GET" as const,
        path: "/api/admin/students" as const,
        responses: {
          200: z.array(z.custom<Student>()),
        }
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/students" as const,
        input: insertStudentSchema,
        responses: {
          201: z.custom<Student>(),
          400: z.object({ message: z.string() }),
        }
      },
      update: {
        method: "PUT" as const,
        path: "/api/admin/students/:id" as const,
        input: insertStudentSchema.partial(),
        responses: {
          200: z.custom<Student>(),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        }
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/students/:id" as const,
        responses: {
          204: z.void(),
          404: z.object({ message: z.string() }),
        }
      },
      import: {
        method: "POST" as const,
        path: "/api/admin/students/import" as const,
        input: z.object({ students: z.array(insertStudentSchema) }),
        responses: {
          201: z.object({ count: z.number() }),
          400: z.object({ message: z.string() }),
        }
      }
    },
    settings: {
      update: {
        method: "PUT" as const,
        path: "/api/admin/settings" as const,
        input: insertSettingsSchema,
        responses: {
          200: z.custom<Setting>(),
          400: z.object({ message: z.string() }),
        }
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
