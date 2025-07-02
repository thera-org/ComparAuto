"use client"

import { NotificationProvider } from '@/contexts/NotificationContext'
import { NotificationContainer } from '@/components/NotificationContainer'
import { EnvironmentWarnings } from '@/components/EnvironmentWarnings'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <NotificationProvider>
      {children}
      <NotificationContainer />
      {/* Comentado temporariamente para evitar avisos desnecessários */}
      {/* {process.env.NODE_ENV === 'development' && <EnvironmentWarnings />} */}
    </NotificationProvider>
  )
}
