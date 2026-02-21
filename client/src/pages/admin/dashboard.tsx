import { useStudents } from "@/hooks/use-students";
import { AdminLayout } from "@/components/layout-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: students, isLoading } = useStudents();

  if (isLoading) return <div>Loading...</div>;

  const total = students?.length || 0;
  const lulus = students?.filter(s => s.status === "LULUS").length || 0;
  const tidakLulus = students?.filter(s => s.status === "TIDAK LULUS").length || 0;
  const ditunda = students?.filter(s => s.status === "DITUNDA").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Ringkasan data kelulusan siswa SMKN 2 Godean.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Siswa" 
            value={total} 
            icon={Users} 
            color="bg-blue-500/10 text-blue-600" 
          />
          <StatsCard 
            title="Lulus" 
            value={lulus} 
            icon={UserCheck} 
            color="bg-green-500/10 text-green-600" 
          />
          <StatsCard 
            title="Tidak Lulus" 
            value={tidakLulus} 
            icon={UserX} 
            color="bg-red-500/10 text-red-600" 
          />
          <StatsCard 
            title="Ditunda" 
            value={ditunda} 
            icon={Clock} 
            color="bg-yellow-500/10 text-yellow-600" 
          />
        </div>

        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Distribusi Jurusan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Group students by major and display counts - simplified for now */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-center text-muted-foreground">
                Data visualisasi distribusi jurusan akan muncul di sini.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold font-display">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
