'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Marker, MapRef } from 'react-map-gl/maplibre'
import { MapPin, Search, Navigation, Loader2, X, AlertCircle } from 'lucide-react'

import BaseMap, { MapPosition, reverseGeocode, geocodeAddress, GeocodingResult } from './BaseMap'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [addressLabel, setAddressLabel] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mapRef = useRef<MapRef | null>(null)
  const geocodeRequestRef = useRef<number>(0)

  // Geocoding reverso quando o marcador é posicionado
  // Usa um contador de requisições para cancelar resultados stale
  // quando o usuário clica rapidamente em múltiplos locais
  const handlePositionChange = useCallback(
    async (pos: MapPosition) => {
      // Move o marcador imediatamente (feedback visual instantâneo)
      setMarkerPosition(pos)
      setAddressLabel('')

      // Notifica a posição imediatamente (sem esperar geocoding)
      onLocationSelect({ lat: pos.lat, lng: pos.lng })

      // Incrementa o contador para invalidar requisições anteriores
      const requestId = ++geocodeRequestRef.current

      const result = await reverseGeocode(pos.lat, pos.lng)

      // Se houve outro clique enquanto aguardava, ignora este resultado
      if (requestId !== geocodeRequestRef.current) return

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
  const handleMarkerDragEnd = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      const pos = { lat: e.lngLat.lat, lng: e.lngLat.lng }
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
      setMarkerPosition(pos)
      setSearchQuery(result.display_name.split(',')[0])
      setShowResults(false)

      // Fly to the selected location
      mapRef.current?.flyTo({
        center: [pos.lng, pos.lat],
        zoom: zoom,
        duration: 1500,
      })

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
    [onLocationSelect, zoom]
  )

  const watchIdRef = useRef<number | null>(null)

  // Para o watch de localização ao desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [])

  // Aplica a localização obtida
  const applyLocation = useCallback(
    (position: GeolocationPosition, shouldFly = false) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      handlePositionChange(pos)

      if (shouldFly) {
        const accuracy = position.coords.accuracy
        const zoomLevel = accuracy < 100 ? zoom : accuracy < 500 ? Math.min(zoom, 15) : 14
        mapRef.current?.flyTo({
          center: [pos.lng, pos.lat],
          zoom: zoomLevel,
          duration: 1500,
        })
      }

      setLocationError(null)
      setIsLocating(false)
    },
    [handlePositionChange, zoom]
  )

  // Trata erros de geolocalização
  const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
    setIsLocating(false)
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError(
          'Permissão de localização bloqueada. Clique no ícone de cadeado (🔒) na barra de endereço do navegador, permita "Localização" e tente novamente.'
        )
        break
      case error.POSITION_UNAVAILABLE:
        setLocationError(
          'Não foi possível determinar sua localização. Verifique se os serviços de localização estão ativados no sistema.'
        )
        break
      case error.TIMEOUT:
        setLocationError('Tempo esgotado ao buscar localização. Tente novamente.')
        break
      default:
        setLocationError('Não foi possível obter sua localização.')
    }
  }, [])

  // Geolocalização: refinamento progressivo
  const handleGetLocation = useCallback(async () => {
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador.')
      return
    }

    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setLocationError('Geolocalização requer conexão segura (HTTPS).')
      return
    }

    // Checa o estado da permissão via Permissions API
    if (navigator.permissions) {
      try {
        const permStatus = await navigator.permissions.query({ name: 'geolocation' })
        if (permStatus.state === 'denied') {
          setLocationError(
            'Localização bloqueada pelo navegador. Clique no ícone de cadeado (🔒) na barra de endereço, mude "Localização" para "Permitir" e recarregue a página.'
          )
          return
        }
      } catch {
        // Permissions API pode não suportar geolocation query em alguns browsers
      }
    }

    // Limpa watch anterior
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    setIsLocating(true)

    // Passo 1: posição rápida para feedback imediato
    navigator.geolocation.getCurrentPosition(
      pos => applyLocation(pos, true),
      () => {
        /* ignora, o watch vai tentar */
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    )

    // Passo 2: watch com alta precisão para refinar
    let refinementCount = 0
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        refinementCount++
        const isFirst = refinementCount === 1
        applyLocation(pos, isFirst)

        if (pos.coords.accuracy < 50 || refinementCount >= 5) {
          navigator.geolocation.clearWatch(watchId)
          watchIdRef.current = null
        }
      },
      error => {
        if (!markerPosition) {
          handleGeolocationError(error)
        }
        navigator.geolocation.clearWatch(watchId)
        watchIdRef.current = null
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
    watchIdRef.current = watchId

    // Timeout de segurança: para o watch após 20s
    setTimeout(() => {
      if (watchIdRef.current === watchId) {
        navigator.geolocation.clearWatch(watchId)
        watchIdRef.current = null
        setIsLocating(false)
      }
    }, 20000)
  }, [applyLocation, handleGeolocationError, markerPosition])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Campo de busca */}
      {showSearch && (
        <div className="absolute left-3 right-3 top-3 z-[10]">
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
        center={markerPosition || { lat: -2.5307, lng: -44.3068 }}
        zoom={markerPosition ? zoom : 13}
        height={height}
        onClick={handleMapClick}
        mapRef={mapRef}
      >
        {markerPosition && (
          <Marker
            longitude={markerPosition.lng}
            latitude={markerPosition.lat}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            anchor="bottom"
          >
            <div className="selection-marker" />
          </Marker>
        )}
      </BaseMap>

      {/* Botão de geolocalização */}
      {showGeolocation && (
        <button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="absolute bottom-4 right-4 z-[10] flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-lg transition hover:bg-gray-50 disabled:opacity-50"
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

      {/* Mensagem de erro de localização */}
      {locationError && (
        <div className="absolute bottom-16 right-4 z-[10] flex max-w-[280px] items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 shadow-lg">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-xs leading-relaxed text-red-700">{locationError}</p>
          <button
            onClick={() => setLocationError(null)}
            className="ml-auto flex-shrink-0 rounded p-0.5 hover:bg-red-100"
          >
            <X className="h-3.5 w-3.5 text-red-400" />
          </button>
        </div>
      )}

      {/* Label do endereço selecionado */}
      {markerPosition && addressLabel && (
        <div className="absolute bottom-4 left-4 z-[10] max-w-[60%] rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <p className="line-clamp-2 text-xs text-gray-600">{addressLabel}</p>
          </div>
        </div>
      )}

      {/* Instrução se não há marcador */}
      {!markerPosition && (
        <div className="pointer-events-none absolute inset-0 z-[9] flex items-center justify-center">
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
