import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { ClientProviders } from '../components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ComparAuto',
  description: 'A melhor plataforma para comparar preços de serviços automotivos',
  keywords: ['comparação', 'serviços automotivos', 'preços', 'oficinas'],
  authors: [{ name: 'ComparAuto' }],
  creator: 'ComparAuto',
  publisher: 'ComparAuto',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
