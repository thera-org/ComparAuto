"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Navigation } from "lucide-react"
import Link from "next/link"

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
        >
        {selectLocationMode && marker && (
          <Marker position={marker} />
        )}
        
        {!selectLocationMode && workshops.map((workshop) => (
          <Marker
            key={workshop.id}
            position={{ lat: workshop.latitude, lng: workshop.longitude }}
            onClick={() => handleMarkerClick(workshop)}
          />
        ))}
        
        {!selectLocationMode && selectedWorkshop && (
          <InfoWindow
            position={{ lat: selectedWorkshop.latitude, lng: selectedWorkshop.longitude }}
            onCloseClick={() => setSelectedWorkshop(null)}
          >
            <div className="p-1 max-w-[250px]">
              <h3 className="font-medium text-sm">{selectedWorkshop.nome}</h3>
              <p className="text-xs text-gray-600 mt-1">{selectedWorkshop.endereco}</p>
              {selectedWorkshop.telefone && (
                <p className="text-xs mt-1">
                  <span className="font-medium">Tel:</span> {selectedWorkshop.telefone}
                </p>
              )}
              <div className="mt-2">
                <Link href={`/oficinas/${selectedWorkshop.id}`} className="text-xs text-blue-600 hover:underline">
                  Ver detalhes
                </Link>
              </div>
            </div>
          </InfoWindow>
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
