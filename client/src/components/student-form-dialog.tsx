import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent, type Student } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStudent, useUpdateStudent } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
}

// Extend schema to validate date string format
const formSchema = insertStudentSchema.extend({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
});

export function StudentFormDialog({ open, onOpenChange, student }: StudentFormDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  
  const form = useForm<InsertStudent>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nis: "",
      name: "",
      major: "",
      birthDate: "",
      status: "LULUS",
      notes: "",
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        nis: student.nis,
        name: student.name,
        major: student.major,
        birthDate: student.birthDate,
        status: student.status,
        notes: student.notes || "",
      });
    } else {
      form.reset({
        nis: "",
        name: "",
        major: "",
        birthDate: "",
        status: "LULUS",
        notes: "",
      });
    }
  }, [student, form, open]);

  const onSubmit = async (data: InsertStudent) => {
    try {
      if (student) {
        await updateMutation.mutateAsync({ id: student.id, ...data });
        toast({ title: "Berhasil", description: "Data siswa berhasil diperbarui." });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Berhasil", description: "Siswa baru berhasil ditambahkan." });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({ 
        title: "Gagal", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIS</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor Induk Siswa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Siswa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurusan</FormLabel>
                    <FormControl>
                      <Input placeholder="Misal: TKJ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Kelulusan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LULUS">LULUS</SelectItem>
                      <SelectItem value="TIDAK LULUS">TIDAK LULUS</SelectItem>
                      <SelectItem value="DITUNDA">DITUNDA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Pesan khusus untuk siswa..." 
                      className="resize-none"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
