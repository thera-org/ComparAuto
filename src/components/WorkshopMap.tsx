"use client"

import { GoogleMap, OverlayView, useLoadScript } from "@react-google-maps/api"
import { Navigation, MapPin, Star, Phone } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback, useRef } from "react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

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
  width: "calc(100% - 32px)",
  height: `calc(${height} - 32px)`,
  position: "relative" as const,
  zIndex: 1,
  margin: "16px",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #e5e7eb"
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
  height = "500px",
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
    libraries: ["places"],
  })

  const fetchWorkshops = useCallback(async () => {
    if (initialWorkshops) return

    try {
      const { data, error } = await supabase
        .from("oficinas")
        .select("id, nome, endereco, latitude, longitude, foto_url, telefone")
        .not("latitude", "is", null)
        .not("longitude", "is", null)

      if (error) throw error
      setWorkshops(data || [])
    } catch (error) {
      console.error("Error fetching workshops:", error)
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
        (position) => {
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
        (error) => {
          console.error("Error getting user location:", error)
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
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (selectLocationMode && onLocationSelect && e.latLng) {
      onLocationSelect(e.latLng.lat(), e.latLng.lng())
    }
  }, [selectLocationMode, onLocationSelect])

  if (loadError) {
    return (
      <div className="map-error-container">
        Erro ao carregar o mapa: {loadError.message}
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="map-loading-container">
        <div className="map-loading-spinner"></div>
        <p style={{ color: "#4b5563", fontFamily: "inherit" }}>Carregando mapa...</p>
      </div>
    )
  }return (
    <div className="map-isolation">
      <div className="map-container-isolated">
        <GoogleMap
          mapContainerStyle={getMapContainerStyle(height)}
          center={mapCenter}
          zoom={13}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={mapOptions}
        >        {/* Custom Airbnb-style markers for workshops */}
        {!selectLocationMode && workshops.map((workshop) => (
          <OverlayView
            key={workshop.id}
            position={{ lat: workshop.latitude, lng: workshop.longitude }}
            mapPaneName="overlayMouseTarget"
          >
            <div
              className={`
                relative cursor-pointer transform transition-all duration-300 hover:scale-110 z-10
                ${selectedWorkshop?.id === workshop.id ? 'scale-110' : ''}
              `}
              onClick={() => handleMarkerClick(workshop)}
            >
              {/* Main marker container */}
              <div className={`
                relative bg-white rounded-full p-2 shadow-lg border-2 transition-all duration-300
                ${selectedWorkshop?.id === workshop.id 
                  ? 'border-blue-500 shadow-blue-200/50 shadow-xl' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                }
              `}>
                {/* Price/Rating indicator */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span>4.8</span>
                  </div>
                </div>
                
                {/* Pointer arrow */}
                <div className={`
                  absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 transition-colors duration-300
                  ${selectedWorkshop?.id === workshop.id 
                    ? 'bg-blue-500' 
                    : 'bg-white border-r border-b border-gray-200'
                  }
                `}></div>
              </div>
              
              {/* Workshop name tooltip on hover */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {workshop.nome}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </OverlayView>
        ))}

        {/* Location marker for selectLocationMode */}
        {selectLocationMode && marker && (
          <OverlayView
            position={marker}
            mapPaneName="overlayMouseTarget"
          >
            <div className="relative">
              <div className="bg-red-500 rounded-full p-3 shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45"></div>
            </div>
          </OverlayView>
        )}
        
        {/* Enhanced InfoWindow for selected workshop */}
        {!selectLocationMode && selectedWorkshop && (
          <OverlayView
            position={{ lat: selectedWorkshop.latitude + 0.001, lng: selectedWorkshop.longitude }}
            mapPaneName="floatPane"
          >
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-[280px] transform -translate-x-1/2 -translate-y-full">
              {/* Close button */}
              <button
                onClick={() => setSelectedWorkshop(null)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="text-gray-500 text-sm">×</span>
              </button>
              
              {/* Workshop info */}
              <div className="pr-6">
                <h3 className="font-semibold text-base text-gray-900 mb-2">{selectedWorkshop.nome}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-gray-500">(124 avaliações)</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  {selectedWorkshop.endereco}
                </p>
                
                {selectedWorkshop.telefone && (
                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedWorkshop.telefone}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Link 
                    href={`/oficina/${selectedWorkshop.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg text-center transition-colors"
                  >
                    Ver detalhes
                  </Link>
                  <button className="px-3 py-2 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Pointer arrow */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45"></div>
            </div>
          </OverlayView>
        )}
      </GoogleMap>
        {!selectLocationMode && (
        <Button
          onClick={getUserLocation}
          className="absolute top-4 left-4 bg-white text-black hover:bg-gray-100 shadow-md z-10"
          size="sm"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Minha Localização
        </Button>
      )}
      </div>
    </div>
  )
}
