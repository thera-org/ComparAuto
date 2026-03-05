'use client'

import L from 'leaflet'
import { Marker } from 'react-leaflet'
import { useState, useCallback, useRef } from 'react'
import { MapPin, Search, Navigation, Loader2, X } from 'lucide-react'

import BaseMap, {
  MapPosition,
  ChangeView,
  selectionIcon,
  reverseGeocode,
  geocodeAddress,
  GeocodingResult,
} from './BaseMap'

// ===== Tipos =====

export interface LocationPickerResult {
  lat: number
  lng: number
  address?: string
  road?: string
  number?: string
  suburb?: string
  city?: string
  state?: string
  postcode?: string
}

interface LocationPickerProps {
  /** Posição inicial do marcador */
  initialPosition?: MapPosition | null
  /** Callback chamado quando a localização é selecionada/alterada */
  onLocationSelect: (result: LocationPickerResult) => void
  /** Altura do mapa */
  height?: string
  /** Zoom inicial */
  zoom?: number
  /** Mostrar campo de busca */
  showSearch?: boolean
  /** Mostrar botão de geolocalização */
  showGeolocation?: boolean
  /** Placeholder do campo de busca */
  searchPlaceholder?: string
  /** Classe CSS adicional */
  className?: string
}

// ===== Componente interno: Marcador arrastável =====

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: MapPosition
  onDragEnd: (pos: MapPosition) => void
}) {
  const markerRef = useRef<L.Marker | null>(null)

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current
      if (marker) {
        const latlng = marker.getLatLng()
        onDragEnd({ lat: latlng.lat, lng: latlng.lng })
      }
    },
  }

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={selectionIcon}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  )
}

// ===== Componente principal: LocationPicker =====

/**
 * Componente de seleção de localização no mapa.
 * Permite:
 * - Clicar no mapa para selecionar localização
 * - Arrastar o marcador
 * - Buscar endereço por texto
 * - Usar geolocalização do navegador
 * - Geocoding reverso automático
 *
 * Usa OpenStreetMap + Nominatim (100% gratuito).
 */
export default function LocationPicker({
  initialPosition,
  onLocationSelect,
  height = '400px',
  zoom = 15,
  showSearch = true,
  showGeolocation = true,
  searchPlaceholder = 'Buscar endereço...',
  className = '',
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<MapPosition | null>(initialPosition || null)
  const [mapCenter, setMapCenter] = useState<MapPosition>(
    initialPosition || { lat: -2.5307, lng: -44.3068 }
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [addressLabel, setAddressLabel] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  // Geocoding reverso quando o marcador é posicionado
  const handlePositionChange = useCallback(
    async (pos: MapPosition) => {
      setMarkerPosition(pos)

      const result = await reverseGeocode(pos.lat, pos.lng)
      const locationResult: LocationPickerResult = {
        lat: pos.lat,
        lng: pos.lng,
      }

      if (result?.address) {
        locationResult.address = result.display_name
        locationResult.road = result.address.road
        locationResult.number = result.address.house_number
        locationResult.suburb = result.address.suburb
        locationResult.city = result.address.city
        locationResult.state = result.address.state
        locationResult.postcode = result.address.postcode
        setAddressLabel(result.display_name)
      }

      onLocationSelect(locationResult)
    },
    [onLocationSelect]
  )

  // Clique no mapa
  const handleMapClick = useCallback(
    (pos: MapPosition) => {
      handlePositionChange(pos)
    },
    [handlePositionChange]
  )

  // Arrastar marcador
  const handleMarkerDrag = useCallback(
    (pos: MapPosition) => {
      handlePositionChange(pos)
    },
    [handlePositionChange]
  )

  // Busca de endereço com debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (value.length < 3) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      // Adiciona contexto de localidade para resultados melhores
      const results = await geocodeAddress(`${value}, São Luís, Maranhão, Brasil`)
      setSearchResults(results)
      setShowResults(results.length > 0)
      setIsSearching(false)
    }, 500)
  }, [])

  // Selecionar resultado da busca
  const handleSelectResult = useCallback(
    (result: GeocodingResult) => {
      const pos = { lat: result.lat, lng: result.lng }
      setMapCenter(pos)
      setMarkerPosition(pos)
      setSearchQuery(result.display_name.split(',')[0])
      setShowResults(false)

      const locationResult: LocationPickerResult = {
        lat: result.lat,
        lng: result.lng,
        address: result.display_name,
        road: result.address?.road,
        number: result.address?.house_number,
        suburb: result.address?.suburb,
        city: result.address?.city,
        state: result.address?.state,
        postcode: result.address?.postcode,
      }

      onLocationSelect(locationResult)
    },
    [onLocationSelect]
  )

  // Geolocalização do navegador
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) return

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setMapCenter(pos)
        handlePositionChange(pos)
        setIsLocating(false)
      },
      error => {
        console.error('Erro ao obter localização:', error)
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [handlePositionChange])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Campo de busca */}
      {showSearch && (
        <div className="absolute left-3 right-3 top-3 z-[1000]">
          <div className="relative">
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <Search className="ml-3 h-4 w-4 flex-shrink-0 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder={searchPlaceholder}
                className="flex-1 border-0 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none"
              />
              {isSearching && <Loader2 className="mr-3 h-4 w-4 animate-spin text-gray-400" />}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    setShowResults(false)
                  }}
                  className="mr-3 rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>

            {/* Resultados da busca */}
            {showResults && (
              <div className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectResult(result)}
                    className="flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="line-clamp-2 text-sm text-gray-700">
                      {result.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mapa */}
      <BaseMap
        center={mapCenter}
        zoom={markerPosition ? zoom : 13}
        height={height}
        onClick={handleMapClick}
        mapRef={mapRef}
      >
        <ChangeView center={mapCenter} zoom={markerPosition ? zoom : undefined} />
        {markerPosition && (
          <DraggableMarker position={markerPosition} onDragEnd={handleMarkerDrag} />
        )}
      </BaseMap>

      {/* Botão de geolocalização */}
      {showGeolocation && (
        <button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-lg transition hover:bg-gray-50 disabled:opacity-50"
          title="Usar minha localização"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Minha localização</span>
        </button>
      )}

      {/* Label do endereço selecionado */}
      {markerPosition && addressLabel && (
        <div className="absolute bottom-4 left-4 z-[1000] max-w-[60%] rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <p className="line-clamp-2 text-xs text-gray-600">{addressLabel}</p>
          </div>
        </div>
      )}

      {/* Instrução se não há marcador */}
      {!markerPosition && (
        <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
          <div className="rounded-full border border-gray-100 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="h-4 w-4 text-primary" />
              Clique no mapa para marcar a localização
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
