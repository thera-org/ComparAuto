"use client"

import { AlertTriangle, Info, X } from "lucide-react"
import { useState } from "react"

import { useEnvironmentCheck } from "@/hooks/useEnvironmentCheck"

export function EnvironmentWarnings() {
  const { hasRequiredEnvVars, missingVars, isMapsConfigured, isStripeConfigured } = useEnvironmentCheck()
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
        dismissible: true // Tornar dismissível para desenvolvimento
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
      dismissible: true
    })
  }

  if (!isStripeConfigured && !dismissed.includes('stripe')) {
    warnings.push({
      id: 'stripe',
      type: 'info' as const,
      title: 'Stripe Não Configurado', 
      message: 'As funcionalidades de pagamento estão desabilitadas.',
      dismissible: true
    })
  }

  const handleDismiss = (id: string) => {
    setDismissed(prev => [...prev, id])
  }

  if (warnings.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {warnings.map((warning) => (
        <div
          key={warning.id}
          className={`
            p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm
            ${warning.type === 'error' 
              ? 'bg-red-50/95 border-red-500 text-red-700' 
              : warning.type === 'warning'
              ? 'bg-yellow-50/95 border-yellow-500 text-yellow-700'
              : 'bg-blue-50/95 border-blue-500 text-blue-700'
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {warning.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              {warning.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {warning.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{warning.title}</h4>
              <p className="text-sm mt-1 opacity-90">{warning.message}</p>
              
              {warning.type === 'error' && (
                <div className="mt-2 text-xs bg-white/50 rounded p-2">
                  <p className="font-medium">Para corrigir:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
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
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
