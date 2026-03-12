'use client'

import { Marker, Popup, MapRef } from 'react-map-gl/maplibre'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Navigation, Star, Phone, MapPin, Loader2, AlertCircle, X } from 'lucide-react'
import Link from 'next/link'

import BaseMap, { MapPosition, getUserLocation } from './BaseMap'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

// ===== Tipos =====

interface Workshop {
  id: string
  nome: string
  endereco: string
  latitude: number
  longitude: number
  foto_url?: string
  telefone?: string
  avaliacao?: number
  total_avaliacoes?: number
}

interface WorkshopMapLeafletProps {
  /** Centro inicial do mapa */
  initialCenter?: MapPosition
  /** Lista de oficinas (se não fornecida, busca do Supabase) */
  workshops?: Workshop[]
  /** Altura do mapa */
  height?: string
  /** Callback ao selecionar uma oficina */
  onWorkshopSelect?: (workshop: Workshop) => void
  /** Modo de seleção de localização (desabilita marcadores de oficinas) */
  selectLocationMode?: boolean
  /** Callback para seleção de localização */
  onLocationSelect?: (lat: number, lng: number) => void
  /** Marcador de localização selecionada */
  marker?: MapPosition | null
  /** Classe CSS adicional */
  className?: string
}

// ===== Componente principal =====

const SAO_LUIS_CENTER: MapPosition = { lat: -2.5307, lng: -44.3068 }

/**
 * Mapa de oficinas usando MapLibre GL + OpenStreetMap (100% gratuito).
 */
export default function WorkshopMapLeaflet({
  initialCenter,
  workshops: initialWorkshops,
  height = '500px',
  onWorkshopSelect,
  selectLocationMode = false,
  onLocationSelect,
  marker,
  className = '',
}: WorkshopMapLeafletProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>(initialWorkshops || [])
  const [mapCenter] = useState<MapPosition>(initialCenter || SAO_LUIS_CENTER)
  const [userLocation, setUserLocation] = useState<MapPosition | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [popupWorkshop, setPopupWorkshop] = useState<Workshop | null>(null)
  const mapRef = useRef<MapRef | null>(null)

  // Buscar oficinas do Supabase se não fornecidas
  const fetchWorkshops = useCallback(async () => {
    if (initialWorkshops) return

    try {
      const { data, error } = await supabase
        .from('oficinas')
        .select('id, nome, endereco, latitude, longitude, foto_url, telefone')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (error) throw error
      setWorkshops(data || [])
    } catch (error) {
      console.error('Erro ao buscar oficinas:', error)
    }
  }, [initialWorkshops])

  useEffect(() => {
    if (initialWorkshops) {
      setWorkshops(initialWorkshops)
    } else {
      fetchWorkshops()
    }
  }, [initialWorkshops, fetchWorkshops])

  // Obter localização do usuário via geolocalização nativa
  const handleGetLocation = useCallback(async () => {
    setLocationError(null)
    setIsLocating(true)

    try {
      const result = await getUserLocation()

      const location: MapPosition = { lat: result.lat, lng: result.lng }
      setUserLocation(location)
      setLocationAccuracy(result.accuracy)

      const zoomLevel = result.accuracy < 100 ? 16 : result.accuracy < 1000 ? 15 : 13
      mapRef.current?.flyTo({
        center: [location.lng, location.lat],
        zoom: zoomLevel,
        duration: 1500,
      })
    } catch (error) {
      const msg = (error as Error).message
      switch (msg) {
        case 'NOT_SUPPORTED':
          setLocationError('Seu navegador não suporta geolocalização.')
          break
        case 'PERMISSION_DENIED':
          setLocationError(
            'Permissão de localização negada. Habilite nas configurações do navegador.'
          )
          break
        case 'TIMEOUT':
          setLocationError('Tempo esgotado ao buscar localização. Tente novamente.')
          break
        default:
          setLocationError(
            'Não foi possível obter sua localização. Verifique se os serviços de localização estão ativos no sistema.'
          )
      }
    } finally {
      setIsLocating(false)
    }
  }, [])

  // Clique no mapa (modo seleção)
  const handleMapClick = useCallback(
    (pos: MapPosition) => {
      if (selectLocationMode && onLocationSelect) {
        onLocationSelect(pos.lat, pos.lng)
      }
    },
    [selectLocationMode, onLocationSelect]
  )

  return (
    <div className={`relative ${className}`}>
      <BaseMap
        center={mapCenter}
        zoom={13}
        height={height}
        onClick={selectLocationMode ? handleMapClick : undefined}
        mapRef={mapRef}
      >
        {/* Marcadores de oficinas */}
        {!selectLocationMode &&
          workshops.map(workshop => (
            <Marker
              key={workshop.id}
              longitude={workshop.longitude}
              latitude={workshop.latitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation()
                setPopupWorkshop(workshop)
                onWorkshopSelect?.(workshop)
              }}
            >
              <div className="workshop-marker">
                <div className="workshop-marker-content">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: '#eab308' }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {workshop.avaliacao ? workshop.avaliacao.toFixed(1) : '4.8'}
                </div>
              </div>
            </Marker>
          ))}

        {/* Popup da oficina selecionada */}
        {popupWorkshop && (
          <Popup
            longitude={popupWorkshop.longitude}
            latitude={popupWorkshop.latitude}
            anchor="bottom"
            offset={[0, -36] as [number, number]}
            onClose={() => setPopupWorkshop(null)}
            closeOnClick={false}
          >
            <div className="min-w-[220px] p-3">
              <h3 className="mb-1 text-base font-semibold text-gray-900">{popupWorkshop.nome}</h3>
              <div className="mb-2 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                <span className="text-sm font-medium">
                  {popupWorkshop.avaliacao?.toFixed(1) || '4.8'}
                </span>
                <span className="text-xs text-gray-500">
                  ({popupWorkshop.total_avaliacoes || 0} avaliações)
                </span>
              </div>
              <p className="mb-2 flex items-start gap-1.5 text-xs text-gray-600">
                <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                {popupWorkshop.endereco}
              </p>
              {popupWorkshop.telefone && (
                <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-600">
                  <Phone className="h-3 w-3 text-gray-400" />
                  {popupWorkshop.telefone}
                </p>
              )}
              <Link
                href={`/oficina/${popupWorkshop.id}`}
                className="block w-full rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                Ver detalhes
              </Link>
            </div>
          </Popup>
        )}

        {/* Marcador de localização selecionada (modo seleção) */}
        {selectLocationMode && marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <div className="selection-marker" />
          </Marker>
        )}

        {/* Marcador da localização do usuário */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              {/* Círculo de precisão (pulsa enquanto refina) */}
              <div
                className={`absolute rounded-full bg-blue-500/15 ${isLocating ? 'animate-ping' : ''}`}
                style={{
                  width: locationAccuracy && locationAccuracy < 200 ? '32px' : '48px',
                  height: locationAccuracy && locationAccuracy < 200 ? '32px' : '48px',
                }}
              />
              {/* Ponto central */}
              <div className="location-pulse" />
            </div>
          </Marker>
        )}
      </BaseMap>

      {/* Botão de localização */}
      {!selectLocationMode && (
        <Button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="absolute left-4 top-4 z-[10] bg-white text-black shadow-md hover:bg-gray-100"
          size="sm"
        >
          {isLocating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="mr-2 h-4 w-4" />
          )}
          {isLocating ? 'Localizando...' : 'Minha Localização'}
        </Button>
      )}

      {/* Mensagem de erro/aviso de localização */}
      {locationError && (
        <div className="absolute left-4 top-16 z-[10] flex max-w-[320px] items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 shadow-lg">
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
    </div>
  )
}
