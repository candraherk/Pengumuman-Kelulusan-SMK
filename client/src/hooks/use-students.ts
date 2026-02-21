import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertStudent, type Student } from "@shared/schema";

export function useStudents() {
  return useQuery({
    queryKey: [api.admin.students.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.students.list.path);
      if (!res.ok) throw new Error("Failed to fetch students");
      return api.admin.students.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStudent) => {
      const res = await fetch(api.admin.students.create.path, {
        method: api.admin.students.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create student");
      }
      return api.admin.students.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.students.list.path] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertStudent>) => {
      const url = buildUrl(api.admin.students.update.path, { id });
      const res = await fetch(url, {
        method: api.admin.students.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update student");
      }
      return api.admin.students.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.students.list.path] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.students.delete.path, { id });
      const res = await fetch(url, {
        method: api.admin.students.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete student");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.students.list.path] });
    },
  });
}

export function useImportStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (students: InsertStudent[]) => {
      const res = await fetch(api.admin.students.import.path, {
        method: api.admin.students.import.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to import students");
      }
      return api.admin.students.import.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.students.list.path] });
    },
  });
}
