'use client'

import { useRef, useCallback } from 'react'
import Map, {
  Marker,
  Popup,
  NavigationControl,
  AttributionControl,
  MapRef,
} from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre'

import MapLibreCSS from './MapLibreCSS'

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

// ===== Geolocalização nativa =====

export interface UserLocationResult {
  lat: number
  lng: number
  accuracy: number
  source: 'gps' | 'network'
}

/**
 * Obtém a localização do usuário via navigator.geolocation.
 * Tenta primeiro com baixa precisão (rede/WiFi, mais rápido),
 * depois refina com alta precisão (GPS) se disponível.
 *
 * No Linux, requer o serviço GeoClue configurado corretamente.
 * Em Chromium/Brave, o app deve estar na whitelist do GeoClue.
 */
export async function getUserLocation(): Promise<UserLocationResult> {
  if (!navigator.geolocation) {
    throw new Error('NOT_SUPPORTED')
  }

  const getPosition = (highAccuracy: boolean, timeout: number) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge: 60000,
      })
    })

  // Tenta com baixa precisão primeiro (WiFi/rede, mais rápido)
  try {
    const position = await getPosition(false, 8000)
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      source: position.coords.accuracy < 100 ? 'gps' : 'network',
    }
  } catch (lowAccError) {
    console.warn('Geolocalização (baixa precisão) falhou, tentando alta precisão...', lowAccError)
  }

  // Fallback: tenta com alta precisão (GPS)
  try {
    const position = await getPosition(true, 15000)
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      source: position.coords.accuracy < 100 ? 'gps' : 'network',
    }
  } catch (error) {
    const geoError = error as GeolocationPositionError
    switch (geoError?.code) {
      case 1: // PERMISSION_DENIED
        throw new Error('PERMISSION_DENIED')
      case 2: // POSITION_UNAVAILABLE
        throw new Error('POSITION_UNAVAILABLE')
      case 3: // TIMEOUT
        throw new Error('TIMEOUT')
      default:
        throw new Error('LOCATION_UNAVAILABLE')
    }
  }
}

// ===== Estilo de mapa OpenStreetMap raster =====

export const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

// ===== Componente BaseMap =====

interface BaseMapProps {
  center?: MapPosition
  zoom?: number
  height?: string
  children?: React.ReactNode
  onClick?: (pos: MapPosition) => void
  className?: string
  mapRef?: React.MutableRefObject<MapRef | null>
}

/**
 * Componente base de mapa usando MapLibre GL + OpenStreetMap (100% gratuito).
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
  const internalMapRef = useRef<MapRef | null>(null)
  const mapRef = externalMapRef || internalMapRef

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (onClick) {
        onClick({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      }
    },
    [onClick]
  )

  return (
    <>
      <MapLibreCSS />
      <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height }}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: center.lng,
            latitude: center.lat,
            zoom: zoom,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={OSM_STYLE}
          onClick={handleClick}
          attributionControl={false}
        >
          <NavigationControl position="top-right" />
          <AttributionControl
            compact={true}
            customAttribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {children}
        </Map>
      </div>
    </>
  )
}

// Re-exportar componentes do react-map-gl para uso externo
export { Marker, Popup, Map }
export type { MapRef }
