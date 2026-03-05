'use client'

import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useRef } from 'react'

import LeafletCSS from './LeafletCSS'

// ===== Ícones customizados =====

/** Ícone padrão vermelho para marcadores */
export const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

/** Ícone azul para localização do usuário */
export const userLocationIcon = new L.DivIcon({
  className: 'location-picker-marker',
  html: '<div class="location-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

/** Ícone vermelho customizado para seleção de localização */
export const selectionIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

/** Ícone azul para oficinas */
export const workshopIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// ===== Tipos =====

export interface MapPosition {
  lat: number
  lng: number
}

export interface GeocodingResult {
  lat: number
  lng: number
  display_name: string
  address?: {
    road?: string
    house_number?: string
    suburb?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
  }
}

// ===== Serviços de Geocoding (Nominatim - gratuito) =====

/** Busca endereço a partir de coordenadas (geocoding reverso) */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`,
      {
        headers: {
          'User-Agent': 'ComparAuto/1.0',
        },
      }
    )
    if (!response.ok) return null
    const data = await response.json()
    return {
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      display_name: data.display_name,
      address: data.address,
    }
  } catch (error) {
    console.error('Erro no geocoding reverso:', error)
    return null
  }
}

/** Busca coordenadas a partir de um endereço (geocoding direto) */
export async function geocodeAddress(address: string): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=5&accept-language=pt-BR`,
      {
        headers: {
          'User-Agent': 'ComparAuto/1.0',
        },
      }
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.map((item: Record<string, unknown>) => ({
      lat: parseFloat(item.lat as string),
      lng: parseFloat(item.lon as string),
      display_name: item.display_name as string,
      address: item.address as GeocodingResult['address'],
    }))
  } catch (error) {
    console.error('Erro no geocoding:', error)
    return []
  }
}

// ===== Componentes auxiliares internos =====

/** Componente que centraliza o mapa quando a posição muda */
function ChangeView({ center, zoom }: { center: MapPosition; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], zoom || map.getZoom(), { animate: true })
    }
  }, [center, zoom, map])
  return null
}

/** Componente que captura cliques no mapa */
function MapClickHandler({ onMapClick }: { onMapClick: (pos: MapPosition) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

/** Componente que expõe a instância do mapa */
function MapRefHandler({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
  }, [map, mapRef])
  return null
}

// ===== Componente BaseMap =====

interface BaseMapProps {
  center?: MapPosition
  zoom?: number
  height?: string
  children?: React.ReactNode
  onClick?: (pos: MapPosition) => void
  className?: string
  mapRef?: React.MutableRefObject<L.Map | null>
}

/**
 * Componente base de mapa usando Leaflet + OpenStreetMap (100% gratuito).
 * Serve como base para todos os outros componentes de mapa.
 */
export default function BaseMap({
  center = { lat: -2.5307, lng: -44.3068 }, // São Luís, MA
  zoom = 13,
  height = '400px',
  children,
  onClick,
  className = '',
  mapRef: externalMapRef,
}: BaseMapProps) {
  const internalMapRef = useRef<L.Map | null>(null)
  const mapRef = externalMapRef || internalMapRef

  return (
    <>
      <LeafletCSS />
      <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRefHandler mapRef={mapRef} />
          {onClick && <MapClickHandler onMapClick={onClick} />}
          {children}
        </MapContainer>
      </div>
    </>
  )
}

// Re-exportar componentes do react-leaflet para uso externo
export { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ChangeView }
