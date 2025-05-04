"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import { metadata } from './metadata' // Importe a metadata

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}