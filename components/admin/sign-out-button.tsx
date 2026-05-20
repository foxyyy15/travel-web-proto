'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
    >
      <LogOut className="w-5 h-5" />
      <span>Keluar</span>
    </Button>
  )
}
