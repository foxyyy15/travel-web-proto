import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  CalendarDays,
  Car,
  FileSpreadsheet,
  MessageSquareQuote,
  Settings,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
import { SignOutButton } from '@/components/admin/sign-out-button'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth()

  // If the path is login, don't show the layout wrapper
  // (Note: Next.js routing groups could do this, but checking session works perfectly)
  if (!session) {
    return <>{children}</>
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'Bookings', icon: FileSpreadsheet },
    { href: '/admin/trips', label: 'Open Trips', icon: CalendarDays },
    { href: '/admin/cars', label: 'Daftar Armada', icon: Car },
    { href: '/admin/testimonials', label: 'Testimoni', icon: MessageSquareQuote },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-20">
        {/* Header/Logo */}
        <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/" className="relative w-40 h-10">
            <Image
              src="/images/logo.png"
              alt="Airlangga Travel"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground line-clamp-1">
              {session.user?.name || 'Administrator'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {session.user?.email || 'admin@airlangga.com'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
              >
                <Icon className="w-5 h-5 text-primary" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-6 md:px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-foreground">
            Panel Administrator
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Aktif sebagai</p>
              <p className="text-sm font-medium text-foreground">
                {session.user?.name || 'Admin'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold sm:hidden">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 bg-secondary/10">
          {children}
        </main>
      </div>
    </div>
  )
}
