'use client'

import { LanguageProvider } from '@/shared/contexts/contexts/LanguageContext'
import { AdminAuthProvider } from '@/shared/admin/contexts/AdminAuthContext'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <LanguageProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </LanguageProvider>
    </AdminAuthProvider>
  )
}
