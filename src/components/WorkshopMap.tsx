'use client'

/**
 * WorkshopMap - Wrapper que usa Leaflet/OpenStreetMap (100% gratuito)
 * Mantém a mesma interface do componente anterior que usava Google Maps
 */

import dynamic from 'next/dynamic'

const WorkshopMapLeaflet = dynamic(() => import('@/components/maps/WorkshopMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div
      className="map-loading-container flex items-center justify-center"
      style={{ height: '500px' }}
    >
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p style={{ color: '#4b5563', fontFamily: 'inherit' }}>Carregando mapa...</p>
      </div>
    </div>
  ),
})

interface Workshop {
  id: string
  nome: string
  endereco: string
  latitude: number
  longitude: number
  foto_url?: string
  telefone?: string
}

interface WorkshopMapProps {
  initialCenter?: { lat: number; lng: number }
  workshops?: Workshop[]
  height?: string
  onWorkshopSelect?: (workshop: Workshop) => void
  selectLocationMode?: boolean
  onLocationSelect?: (lat: number, lng: number) => void
  marker?: { lat: number; lng: number } | null
}

export default function WorkshopMap({
  initialCenter,
  workshops,
  height = '500px',
  onWorkshopSelect,
  selectLocationMode = false,
  onLocationSelect,
  marker,
}: WorkshopMapProps) {
  return (
    <WorkshopMapLeaflet
      initialCenter={initialCenter}
      workshops={workshops}
      height={height}
      onWorkshopSelect={onWorkshopSelect}
      selectLocationMode={selectLocationMode}
      onLocationSelect={onLocationSelect}
      marker={marker}
    />
  )
}
