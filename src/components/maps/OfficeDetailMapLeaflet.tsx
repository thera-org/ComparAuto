'use client'

import { Marker, Popup } from 'react-leaflet'
import { MapPin, Navigation } from 'lucide-react'

import BaseMap, { MapPosition, defaultIcon } from './BaseMap'

// ===== Tipos =====

interface OfficeDetailMapLeafletProps {
  /** Latitude da oficina */
  latitude: number
  /** Longitude da oficina */
  longitude: number
  /** Nome da oficina */
  nome: string
  /** Endereço da oficina */
  endereco: string
  /** Altura do mapa */
  height?: string
  /** Classe CSS adicional */
  className?: string
}

/**
 * Mapa de detalhes de uma oficina usando Leaflet + OpenStreetMap (100% gratuito).
 * Mostra um marcador fixo na localização da oficina.
 */
export default function OfficeDetailMapLeaflet({
  latitude,
  longitude,
  nome,
  endereco,
  height = '300px',
  className = '',
}: OfficeDetailMapLeafletProps) {
  const center: MapPosition = {
    lat: latitude || -2.5307,
    lng: longitude || -44.3068,
  }

  const hasValidCoords = latitude && longitude && latitude !== 0 && longitude !== 0

  if (!hasValidCoords) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`}
        style={{ height }}
      >
        <div className="space-y-2 text-center">
          <MapPin className="mx-auto h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Localização não disponível</p>
          <p className="text-xs text-gray-500">{endereco}</p>
        </div>
      </div>
    )
  }

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className={`relative ${className}`}>
      <BaseMap center={center} zoom={16} height={height}>
        <Marker position={[center.lat, center.lng]} icon={defaultIcon}>
          <Popup>
            <div className="min-w-[200px] p-1">
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{nome}</h3>
              <p className="mb-2 text-xs text-gray-600">{endereco}</p>
              <button
                onClick={handleOpenMaps}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Navigation className="h-3 w-3" />
                Traçar rota
              </button>
            </div>
          </Popup>
        </Marker>
      </BaseMap>

      {/* Botão flutuante para abrir no Maps */}
      <button
        onClick={handleOpenMaps}
        className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-md transition hover:bg-gray-50"
        title="Abrir no Google Maps"
      >
        <Navigation className="h-3.5 w-3.5" />
        Traçar rota
      </button>
    </div>
  )
}
