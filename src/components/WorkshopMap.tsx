'use client'

import { GoogleMap, OverlayView, useLoadScript } from '@react-google-maps/api'
import { Navigation, MapPin, Star, Phone } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

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

const saoLuisCenter = { lat: -2.5307, lng: -44.3068 }

const getMapContainerStyle = (height: string) => ({
  width: 'calc(100% - 32px)',
  height: `calc(${height} - 32px)`,
  position: 'relative' as const,
  zIndex: 1,
  margin: '16px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #e5e7eb',
})

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  zoomControl: true,
  disableDefaultUI: false,
}

export default function WorkshopMap({
  initialCenter,
  workshops: initialWorkshops,
  height = '500px',
  onWorkshopSelect,
  selectLocationMode = false,
  onLocationSelect,
  marker,
}: WorkshopMapProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>(initialWorkshops || [])
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [mapCenter, setMapCenter] = useState(initialCenter || saoLuisCenter)
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  })

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
      console.error('Error fetching workshops:', error)
    }
  }, [initialWorkshops])

  useEffect(() => {
    if (initialWorkshops) {
      setWorkshops(initialWorkshops)
    } else {
      fetchWorkshops()
    }
  }, [initialWorkshops, fetchWorkshops])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setMapCenter(location)

          if (mapRef.current) {
            mapRef.current.panTo(location)
            mapRef.current.setZoom(14)
          }
        },
        error => {
          console.error('Error getting user location:', error)
        }
      )
    }
  }

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const handleMarkerClick = (workshop: Workshop) => {
    setSelectedWorkshop(workshop)
    if (onWorkshopSelect) {
      onWorkshopSelect(workshop)
    }
  }
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (selectLocationMode && onLocationSelect && e.latLng) {
        onLocationSelect(e.latLng.lat(), e.latLng.lng())
      }
    },
    [selectLocationMode, onLocationSelect]
  )

  if (loadError) {
    return <div className="map-error-container">Erro ao carregar o mapa: {loadError.message}</div>
  }

  if (!isLoaded) {
    return (
      <div className="map-loading-container">
        <div className="map-loading-spinner"></div>
        <p style={{ color: '#4b5563', fontFamily: 'inherit' }}>Carregando mapa...</p>
      </div>
    )
  }
  return (
    <div className="map-isolation">
      <div className="map-container-isolated">
        <GoogleMap
          mapContainerStyle={getMapContainerStyle(height)}
          center={mapCenter}
          zoom={13}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {' '}
          {/* Custom Airbnb-style markers for workshops */}
          {!selectLocationMode &&
            workshops.map(workshop => (
              <OverlayView
                key={workshop.id}
                position={{ lat: workshop.latitude, lng: workshop.longitude }}
                mapPaneName="overlayMouseTarget"
              >
                <div
                  className={`
                relative z-10 transform cursor-pointer transition-all duration-300 hover:scale-110
                ${selectedWorkshop?.id === workshop.id ? 'scale-110' : ''}
              `}
                  onClick={() => handleMarkerClick(workshop)}
                >
                  {/* Main marker container */}
                  <div
                    className={`
                relative rounded-full border-2 bg-white p-2 shadow-lg transition-all duration-300
                ${
                  selectedWorkshop?.id === workshop.id
                    ? 'border-blue-500 shadow-xl shadow-blue-200/50'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                }
              `}
                  >
                    {/* Price/Rating indicator */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Pointer arrow */}
                    <div
                      className={`
                  absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 transform transition-colors duration-300
                  ${
                    selectedWorkshop?.id === workshop.id
                      ? 'bg-blue-500'
                      : 'border-b border-r border-gray-200 bg-white'
                  }
                `}
                    ></div>
                  </div>

                  {/* Workshop name tooltip on hover */}
                  <div className="pointer-events-none absolute -top-12 left-1/2 z-20 -translate-x-1/2 transform opacity-0 transition-opacity duration-300 hover:opacity-100">
                    <div className="whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white">
                      {workshop.nome}
                    </div>
                    <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </OverlayView>
            ))}
          {/* Location marker for selectLocationMode */}
          {selectLocationMode && marker && (
            <OverlayView position={marker} mapPaneName="overlayMouseTarget">
              <div className="relative">
                <div className="rounded-full border-2 border-white bg-red-500 p-3 shadow-lg">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 transform bg-red-500"></div>
              </div>
            </OverlayView>
          )}
          {/* Enhanced InfoWindow for selected workshop */}
          {!selectLocationMode && selectedWorkshop && (
            <OverlayView
              position={{ lat: selectedWorkshop.latitude + 0.001, lng: selectedWorkshop.longitude }}
              mapPaneName="floatPane"
            >
              <div className="relative max-w-[280px] -translate-x-1/2 -translate-y-full transform rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
                {/* Close button */}
                <button
                  onClick={() => setSelectedWorkshop(null)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                >
                  <span className="text-sm text-gray-500">×</span>
                </button>

                {/* Workshop info */}
                <div className="pr-6">
                  <h3 className="mb-2 text-base font-semibold text-gray-900">
                    {selectedWorkshop.nome}
                  </h3>

                  <div className="mb-2 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-sm text-gray-500">(124 avaliações)</span>
                  </div>

                  <p className="mb-3 flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    {selectedWorkshop.endereco}
                  </p>

                  {selectedWorkshop.telefone && (
                    <p className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {selectedWorkshop.telefone}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/oficina/${selectedWorkshop.id}`}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      Ver detalhes
                    </Link>
                    <button className="rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:border-gray-400">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Pointer arrow */}
                <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transform border-b border-r border-gray-200 bg-white"></div>
              </div>
            </OverlayView>
          )}
        </GoogleMap>
        {!selectLocationMode && (
          <Button
            onClick={getUserLocation}
            className="absolute left-4 top-4 z-10 bg-white text-black shadow-md hover:bg-gray-100"
            size="sm"
          >
            <Navigation className="mr-2 h-4 w-4" />
            Minha Localização
          </Button>
        )}
      </div>
    </div>
  )
}
