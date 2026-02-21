import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type CheckInput = z.infer<typeof api.public.check.input>;

export function useCheckGraduation() {
  return useMutation({
    mutationFn: async (data: CheckInput) => {
      const res = await fetch(api.public.check.path, {
        method: api.public.check.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Terjadi kesalahan saat mengecek data.");
      }

      return api.public.check.responses[200].parse(await res.json());
    },
  });
}
