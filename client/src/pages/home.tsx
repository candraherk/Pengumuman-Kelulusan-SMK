import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettings } from "@/hooks/use-settings";
import { useCheckGraduation } from "@/hooks/use-check-graduation";
import { CountdownTimer } from "@/components/countdown-timer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import ReactConfetti from "react-confetti";
import { GraduationCap, AlertCircle, Download, CheckCircle2, XCircle } from "lucide-react";
import { z } from "zod";

// Background image of school - generic educational background
// https://images.unsplash.com/photo-1523050854058-8df90110c9f1
import schoolBg from "@assets/school-bg.jpg"; // Placeholder import, assuming assets exist or handled by build

const checkSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
});

export default function Home() {
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const checkMutation = useCheckGraduation();
  const [result, setResult] = useState<any>(null);

  const form = useForm<z.infer<typeof checkSchema>>({
    resolver: zodResolver(checkSchema),
    defaultValues: {
      nis: "",
      birthDate: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof checkSchema>) => {
    try {
      const res = await checkMutation.mutateAsync(data);
      setResult(res);
    } catch (error) {
      setResult(null);
      // Error handled by mutation state, shown below
    }
  };

  const handleCountdownComplete = () => {
    // Ideally refresh settings to see if backend opened it automatically
    // or just show a message "Waktunya pengumuman! Silakan refresh."
    window.location.reload();
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isOpen = settings?.isOpen;
  const showCountdown = !isOpen && settings?.announcementDate;
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {result?.status === "LULUS" && <ReactConfetti recycle={false} numberOfPieces={500} />}

      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <header className="w-full p-6 flex justify-center z-10">
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md py-3 px-6 rounded-full border border-white/30 shadow-sm">
          {/* Logo would go here */}
          <GraduationCap className="w-8 h-8 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold font-display leading-tight text-foreground">SMKN 2 Godean</h1>
            <p className="text-xs text-muted-foreground tracking-wide">PENGUMUMAN KELULUSAN 2026</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-4 text-gradient">
            Generasi Unggul 2026
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selamat datang di portal resmi pengumuman kelulusan siswa-siswi SMKN 2 Godean. 
            Silakan cek status kelulusan Anda di bawah ini.
          </p>
        </motion.div>

        {showCountdown ? (
          <div className="w-full">
            <h3 className="text-center text-xl font-medium text-muted-foreground mb-4">
              Pengumuman akan dibuka dalam:
            </h3>
            <CountdownTimer 
              targetDate={settings!.announcementDate!} 
              onComplete={handleCountdownComplete} 
            />
            <div className="text-center mt-8 p-4 bg-yellow-500/10 text-yellow-700 rounded-xl border border-yellow-500/20 inline-block">
              <p className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Formulir pengecekan akan tersedia saat hitung mundur selesai.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Check Form */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-panel overflow-hidden border-0">
                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <SearchIcon className="w-5 h-5 text-primary" />
                    Cek Status Kelulusan
                  </h3>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor Induk Siswa (NIS)</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: 12345" {...field} className="glass-input" />
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
                              <Input type="date" {...field} className="glass-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:to-primary shadow-lg shadow-primary/25 mt-4"
                        size="lg"
                        disabled={checkMutation.isPending}
                      >
                        {checkMutation.isPending ? "Memeriksa Data..." : "Lihat Hasil"}
                      </Button>

                      {checkMutation.isError && (
                        <div className="mt-4 p-3 bg-red-500/10 text-red-600 text-sm rounded-lg flex items-center gap-2">
                          <XCircle className="w-4 h-4 shrink-0" />
                          {checkMutation.error.message}
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Result Display */}
            <div className="relative min-h-[300px]">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full"
                  >
                    <Card className={`glass-panel border-0 overflow-hidden ${
                      result.status === "LULUS" ? "ring-2 ring-green-500/50" : "ring-2 ring-red-500/50"
                    }`}>
                      <div className={`h-32 flex items-center justify-center ${
                        result.status === "LULUS" 
                          ? "bg-gradient-to-br from-green-500/20 to-green-600/20" 
                          : "bg-gradient-to-br from-red-500/20 to-red-600/20"
                      }`}>
                         {result.status === "LULUS" ? (
                           <CheckCircle2 className="w-16 h-16 text-green-600" />
                         ) : (
                           <XCircle className="w-16 h-16 text-red-600" />
                         )}
                      </div>
                      <CardContent className="p-8 text-center">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Hasil Kelulusan
                        </h4>
                        <h2 className={`text-3xl font-bold font-display mb-4 ${
                          result.status === "LULUS" ? "text-green-600" : "text-red-600"
                        }`}>
                          ANDA DINYATAKAN {result.status}
                        </h2>
                        
                        <div className="space-y-2 mb-8 text-left bg-white/50 p-4 rounded-xl border border-white/50">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nama:</span>
                            <span className="font-semibold">{result.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Jurusan:</span>
                            <span className="font-semibold">{result.major}</span>
                          </div>
                          {result.notes && (
                            <div className="pt-2 mt-2 border-t border-dashed border-gray-300">
                              <p className="text-sm italic text-muted-foreground">{result.notes}</p>
                            </div>
                          )}
                        </div>

                        {result.status === "LULUS" ? (
                           <div className="space-y-4">
                             <p className="text-sm text-muted-foreground">
                               Selamat atas keberhasilan Anda! Surat Keterangan Lulus (SKL) dapat diunduh melalui tombol di bawah ini.
                             </p>
                             <Button className="w-full gap-2" variant="outline">
                               <Download className="w-4 h-4" />
                               Download SKL (Segera Hadir)
                             </Button>
                           </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Tetap semangat! Hubungi pihak sekolah atau wali kelas untuk informasi lebih lanjut mengenai status kelulusan Anda.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 glass-panel rounded-2xl opacity-60"
                  >
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <SearchIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-muted-foreground">Menunggu Data</h3>
                    <p className="text-sm text-muted-foreground/70 max-w-xs mt-2">
                      Masukkan NIS dan Tanggal Lahir Anda pada formulir di samping untuk melihat hasil.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="mt-12 text-center max-w-2xl">
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <h4 className="font-semibold text-blue-700 mb-2">Himbauan Sekolah</h4>
            <p className="text-sm text-blue-600/80">
              Siswa dilarang melakukan konvoi, corat-coret seragam, dan tindakan anarkis lainnya. 
              Rayakan kelulusan dengan hal-hal positif dan bermartabat.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-muted-foreground z-10 bg-white/30 backdrop-blur-sm border-t border-white/20">
        <p className="font-medium">SMKN 2 Godean</p>
        <p className="text-xs mt-1">Jl. Godean Km 6.5, Sidoarum, Godean, Sleman, Yogyakarta</p>
        <p className="text-xs mt-4 opacity-50">&copy; 2026 Tim IT SMKN 2 Godean</p>
      </footer>
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
