'use client'

import { AlertTriangle, Info, X } from 'lucide-react'
import { useState } from 'react'

import { useEnvironmentCheck } from '@/hooks/useEnvironmentCheck'

export function EnvironmentWarnings() {
  const { hasRequiredEnvVars, missingVars, isMapsConfigured, isStripeConfigured } =
    useEnvironmentCheck()
  const [dismissed, setDismissed] = useState<string[]>([])

  const warnings = []

  // Apenas mostrar erro se realmente crítico e as variáveis estão mesmo faltando
  if (!hasRequiredEnvVars && missingVars.length > 0) {
    // Verificar se as variáveis estão realmente faltando no runtime
    const actuallyMissing = missingVars.filter(varName => {
      if (typeof window !== 'undefined') {
        // No cliente, verificar se a variável está disponível
        return !process.env[varName]
      }
      return true
    })

    if (actuallyMissing.length > 0) {
      warnings.push({
        id: 'missing-required',
        type: 'error' as const,
        title: 'Configuração Obrigatória Ausente',
        message: `Variáveis de ambiente obrigatórias não configuradas: ${actuallyMissing.join(', ')}`,
        dismissible: true, // Tornar dismissível para desenvolvimento
      })
    }
  }

  // Avisos opcionais apenas se realmente faltando
  if (!isMapsConfigured && !dismissed.includes('maps')) {
    warnings.push({
      id: 'maps',
      type: 'warning' as const,
      title: 'Google Maps Não Configurado',
      message: 'As funcionalidades de mapa podem não funcionar corretamente.',
      dismissible: true,
    })
  }

  if (!isStripeConfigured && !dismissed.includes('stripe')) {
    warnings.push({
      id: 'stripe',
      type: 'info' as const,
      title: 'Stripe Não Configurado',
      message: 'As funcionalidades de pagamento estão desabilitadas.',
      dismissible: true,
    })
  }

  const handleDismiss = (id: string) => {
    setDismissed(prev => [...prev, id])
  }

  if (warnings.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-50 max-w-md space-y-2">
      {warnings.map(warning => (
        <div
          key={warning.id}
          className={`
            rounded-lg border-l-4 p-4 shadow-lg backdrop-blur-sm
            ${
              warning.type === 'error'
                ? 'border-red-500 bg-red-50/95 text-red-700'
                : warning.type === 'warning'
                  ? 'border-yellow-500 bg-yellow-50/95 text-yellow-700'
                  : 'border-blue-500 bg-blue-50/95 text-blue-700'
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              {warning.type === 'error' && <AlertTriangle className="h-5 w-5" />}
              {warning.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
              {warning.type === 'info' && <Info className="h-5 w-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold">{warning.title}</h4>
              <p className="mt-1 text-sm opacity-90">{warning.message}</p>

              {warning.type === 'error' && (
                <div className="mt-2 rounded bg-white/50 p-2 text-xs">
                  <p className="font-medium">Para corrigir:</p>
                  <ol className="mt-1 list-inside list-decimal space-y-1">
                    <li>Copie o arquivo .env.example para .env.local</li>
                    <li>Configure as variáveis necessárias</li>
                    <li>Reinicie o servidor de desenvolvimento</li>
                  </ol>
                </div>
              )}
            </div>

            {warning.dismissible && (
              <button
                onClick={() => handleDismiss(warning.id)}
                className="flex-shrink-0 rounded p-1 transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
