import { useState } from "react";
import { useStudents, useDeleteStudent, useImportStudents } from "@/hooks/use-students";
import { AdminLayout } from "@/components/layout-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StudentFormDialog } from "@/components/student-form-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MoreHorizontal, FileUp, Download, Trash2, Pencil } from "lucide-react";
import type { Student, InsertStudent } from "@shared/schema";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminStudents() {
  const { data: students, isLoading } = useStudents();
  const deleteMutation = useDeleteStudent();
  const importMutation = useImportStudents();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search) ||
    s.major.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: "Berhasil", description: "Data siswa dihapus." });
      } catch (error) {
        toast({ title: "Gagal", description: "Gagal menghapus data.", variant: "destructive" });
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const parsedStudents: InsertStudent[] = [];

      // Skip header, start from index 1
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // CSV Format: NIS,Name,Major,BirthDate(YYYY-MM-DD),Status,Notes
        const [nis, name, major, birthDate, status, notes] = line.split(',');
        
        if (nis && name && major && birthDate && status) {
          parsedStudents.push({
            nis,
            name,
            major,
            birthDate,
            status,
            notes: notes || ""
          });
        }
      }

      try {
        const result = await importMutation.mutateAsync(parsedStudents);
        toast({ title: "Import Berhasil", description: `${result.count} data siswa berhasil diimpor.` });
      } catch (error: any) {
        toast({ title: "Import Gagal", description: error.message, variant: "destructive" });
      }
      
      // Reset input
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (!students || students.length === 0) return;

    const headers = ["NIS,Name,Major,BirthDate,Status,Notes"];
    const rows = students.map(s => 
      `${s.nis},"${s.name}",${s.major},${s.birthDate},${s.status},"${s.notes || ''}"`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold">Data Siswa</h2>
            <p className="text-muted-foreground">Kelola data siswa, kelulusan, dan nilai.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input 
                type="file" 
                id="csv-upload" 
                className="hidden" 
                accept=".csv"
                onChange={handleFileUpload}
              />
              <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
                <FileUp className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Siswa
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari nama, NIS, atau jurusan..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jurusan</TableHead>
                <TableHead>Tgl Lahir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredStudents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.nis}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.major}</TableCell>
                    <TableCell>{format(new Date(student.birthDate), "d MMM yyyy", { locale: id })}</TableCell>
                    <TableCell>
                      <Badge variant={
                        student.status === "LULUS" ? "default" : 
                        student.status === "TIDAK LULUS" ? "destructive" : "secondary"
                      }>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(student)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(student.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <StudentFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        student={editingStudent} 
      />
    </AdminLayout>
  );
}
