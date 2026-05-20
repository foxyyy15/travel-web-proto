import { prisma } from '@/lib/prisma'
import {
  Settings,
  Database,
  Lock,
  User,
  ShieldAlert,
  Terminal,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

async function checkDatabaseConnection(): Promise<{
  connected: boolean
  provider: string
  urlPresent: boolean
}> {
  const urlPresent = !!process.env.DATABASE_URL
  if (!urlPresent) {
    return { connected: false, provider: 'none', urlPresent: false }
  }

  try {
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`
    return { connected: true, provider: 'Supabase (PostgreSQL)', urlPresent: true }
  } catch (e) {
    return { connected: false, provider: 'PostgreSQL (Failed to connect)', urlPresent: true }
  }
}

export default async function SettingsPage() {
  const dbStatus = await checkDatabaseConnection()

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Pengaturan Sistem
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola konfigurasi aplikasi, akun administrator, dan status database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 bg-card border border-border rounded-2xl p-4 h-fit space-y-1 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary font-medium rounded-xl text-sm">
            <Settings className="w-5 h-5" />
            <span>Konektivitas & Akun</span>
          </div>
        </div>

        {/* Configuration Contents */}
        <div className="md:col-span-2 space-y-6">
          {/* Database Connectivity */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-foreground">
                  Status Database
                </h3>
                <p className="text-xs text-muted-foreground">
                  Koneksi antara server Next.js dengan Supabase
                </p>
              </div>
            </div>

            <div className="divide-y divide-border pt-2">
              <div className="py-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status Koneksi</span>
                <Badge
                  className={
                    dbStatus.connected
                      ? 'bg-success text-success-foreground hover:bg-success'
                      : 'bg-destructive text-destructive-foreground hover:bg-destructive'
                  }
                >
                  {dbStatus.connected ? 'Terhubung' : 'Terputus'}
                </Badge>
              </div>

              <div className="py-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Provider Database</span>
                <span className="font-medium text-foreground">{dbStatus.provider}</span>
              </div>

              <div className="py-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Variabel DATABASE_URL</span>
                <Badge variant={dbStatus.urlPresent ? 'outline' : 'destructive'}>
                  {dbStatus.urlPresent ? 'Terdeteksi' : 'Tidak Ditemukan (.env)'}
                </Badge>
              </div>
            </div>

            {!dbStatus.connected && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-amber-600">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-xs text-foreground">Langkah Penyelesaian Koneksi:</h4>
                    <ul className="list-decimal pl-4 text-xs text-muted-foreground space-y-1 leading-relaxed">
                      <li>
                        Buka file <code className="bg-background border border-border px-1 rounded font-mono text-[10px]">.env</code> di root direktori project.
                      </li>
                      <li>
                        Tambahkan baris berikut (sesuaikan dengan credentials Supabase Anda):
                        <pre className="mt-1.5 p-2 bg-background border border-border rounded font-mono text-[10px] text-foreground overflow-x-auto">
{`DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?schema=public"`}
                        </pre>
                      </li>
                      <li>
                        Jalankan sinkronisasi skema database melalui terminal:
                        <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[10px] text-primary">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>npx prisma db push</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Account Settings */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-foreground">
                  Akun Administrator
                </h3>
                <p className="text-xs text-muted-foreground">
                  Akun saat ini untuk mengelola aplikasi
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-secondary/50 rounded-xl space-y-2 border border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Default</span>
                  <span className="font-medium text-foreground">admin@airlanggatravel.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium text-foreground capitalize">Super Admin</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-secondary/20 p-4 border border-border rounded-xl">
                <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Untuk alasan keamanan, perubahan password akun admin dapat dilakukan secara langsung di tabel 
                  <code className="mx-1 px-1 bg-background border border-border rounded font-mono text-[10px]">admin_users</code> Supabase Anda dengan menggunakan hash bcrypt, atau hubungi tim IT Developer Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
