'use client'

/**
 * OfficeDetailMap - Wrapper que usa MapLibre GL + OpenStreetMap (100% gratuito)
 */

import dynamic from 'next/dynamic'

const OfficeDetailMapLeaflet = dynamic(() => import('@/components/maps/OfficeDetailMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-700">Carregando mapa...</p>
      </div>
    </div>
  ),
})

interface OfficeDetailMapProps {
  latitude: number
  longitude: number
  nome: string
  endereco: string
}

export default function OfficeDetailMap({
  latitude,
  longitude,
  nome,
  endereco,
}: OfficeDetailMapProps) {
  return (
    <OfficeDetailMapLeaflet
      latitude={latitude}
      longitude={longitude}
      nome={nome}
      endereco={endereco}
    />
  )
}
