import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertSetting } from "@shared/schema";

export function useSettings() {
  return useQuery({
    queryKey: [api.public.settings.path],
    queryFn: async () => {
      const res = await fetch(api.public.settings.path);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.public.settings.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSetting) => {
      const res = await fetch(api.admin.settings.update.path, {
        method: api.admin.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.admin.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.public.settings.path] });
    },
  });
}
