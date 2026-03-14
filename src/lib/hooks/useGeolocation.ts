'use client'

import { useState, useCallback } from 'react'

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error'

export interface GeolocationState {
  lat: number | null
  lng: number | null
  status: GeolocationStatus
  error: string | null
  requestLocation: () => void
}

// Constante numérica — evita referência ao global GeolocationPositionError
// que só existe no browser (causa ReferenceError em testes Node/SSR)
const GEO_PERMISSION_DENIED = 1

export function useGeolocation(): GeolocationState {
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('error')
      setError('Geolocalização não suportada neste browser.')
      return
    }

    setStatus('loading')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
        setStatus('success')
      },
      (err) => {
        if (err.code === GEO_PERMISSION_DENIED) {
          setStatus('denied')
          setError('Permissão de localização negada.')
        } else {
          setStatus('error')
          setError('Não foi possível obter sua localização.')
        }
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  return { lat, lng, status, error, requestLocation }
}
