import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema, type InsertSetting } from "@shared/schema";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { AdminLayout } from "@/components/layout-admin";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";

// Frontend validation schema
const settingsFormSchema = z.object({
  announcementDate: z.string().optional(),
  isOpen: z.boolean(),
});

export default function AdminSettings() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      announcementDate: "",
      isOpen: false,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        announcementDate: settings.announcementDate ? new Date(settings.announcementDate).toISOString().slice(0, 16) : "",
        isOpen: settings.isOpen,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: z.infer<typeof settingsFormSchema>) => {
    try {
      console.log("Submitting settings data:", data);
      const payload: InsertSetting = {
        isOpen: data.isOpen,
        announcementDate: data.announcementDate ? new Date(data.announcementDate) : null,
      };

      console.log("Sending payload to API:", payload);
      await updateMutation.mutateAsync(payload);
      toast({ title: "Berhasil", description: "Pengaturan berhasil diperbarui." });
    } catch (error: any) {
      console.error("Error submitting settings:", error);
      const message = error.response?.data?.message || error.message || "Gagal menyimpan pengaturan.";
      toast({ title: "Gagal", description: message, variant: "destructive" });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-display font-bold">Pengaturan Pengumuman</h2>
          <p className="text-muted-foreground">Atur jadwal dan status pengumuman kelulusan.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Konfigurasi Utama</CardTitle>
            <CardDescription>
              Pengaturan ini akan mempengaruhi apa yang dilihat oleh pengunjung publik.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="isOpen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Buka Pengumuman</FormLabel>
                        <FormDescription>
                          Jika aktif, siswa dapat mengecek hasil kelulusan mereka.
                          Jika non-aktif, akan menampilkan hitung mundur (jika tanggal diatur).
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="announcementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal & Waktu Pengumuman</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        Digunakan untuk hitung mundur di halaman depan.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
