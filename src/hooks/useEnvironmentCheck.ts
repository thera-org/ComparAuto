import { useEffect, useState } from 'react'

interface EnvironmentCheck {
  isSupabaseConfigured: boolean
  isMapsConfigured: boolean
  isStripeConfigured: boolean
  hasRequiredEnvVars: boolean
  missingVars: string[]
}

export function useEnvironmentCheck(): EnvironmentCheck {
  const [check, setCheck] = useState<EnvironmentCheck>({
    isSupabaseConfigured: false,
    isMapsConfigured: false,
    isStripeConfigured: false,
    hasRequiredEnvVars: false,
    missingVars: [],
  })

  useEffect(() => {
    const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']

    // Aguardar o Next.js carregar as variáveis completamente
    const checkEnvironment = () => {
      const missingRequired = requiredVars.filter(varName => {
        const envValue = process.env[varName]
        return !envValue || envValue === '' || envValue === 'undefined'
      })

      const isSupabaseConfigured = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== '' &&
          process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined' &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined'
      )

      const isMapsConfigured = Boolean(
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== '' &&
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'undefined'
      )

      const isStripeConfigured = Boolean(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== '' &&
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'undefined'
      )

      setCheck({
        isSupabaseConfigured,
        isMapsConfigured,
        isStripeConfigured,
        hasRequiredEnvVars: missingRequired.length === 0,
        missingVars: missingRequired,
      })

      // Log warnings for missing optional variables (apenas no desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        if (!isMapsConfigured) {
          console.warn('Google Maps API key not configured. Maps may not work.')
        }

        if (!isStripeConfigured) {
          console.warn('Stripe not configured. Payment features will be disabled.')
        }

        // Log errors for missing required variables
        if (missingRequired.length > 0) {
          console.error('Missing required environment variables:', missingRequired)
          console.log('Current environment variables:', {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
              ? 'SET'
              : 'MISSING',
          })
        }
      }
    }

    // Aguardar um pouco para garantir que as variáveis estão carregadas
    const timer = setTimeout(checkEnvironment, 100)

    return () => clearTimeout(timer)
  }, [])

  return check
}
