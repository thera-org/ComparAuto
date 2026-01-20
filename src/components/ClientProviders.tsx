'use client'

import { EnvironmentWarnings } from '@/components/EnvironmentWarnings'
import { NotificationContainer } from '@/components/NotificationContainer'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <NotificationProvider>
      <AuthProvider>
        {children}
        <NotificationContainer />
        {/* Comentado temporariamente para evitar avisos desnecessários */}
        {/* {process.env.NODE_ENV === 'development' && <EnvironmentWarnings />} */}
      </AuthProvider>
    </NotificationProvider>
  )
}
