"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Navigation } from "lucide-react"
import Link from "next/link"

// Add this after the other imports
declare global {
  interface Window {
    initMap: () => void
    google: typeof google
  }
}

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

const mapContainerStyle = {
  width: "100%",
  borderRadius: "0.5rem",
}

const saoLuisCenter = { lat: -2.5307, lng: -44.3068 }; // Centro de São Luís do Maranhão

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
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', // We'll load the API key from a script tag instead
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

  // This ensures the Google Maps script is loaded without exposing the API key in the client bundle
  useEffect(() => {
    // Check if the script is already loaded
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]') && !window.google?.maps) {
      // Define the callback function
      window.initMap = () => {
        console.log("Google Maps API loaded")
      }

      // Fetch the script URL from our secure API route
      fetch("/api/maps")
        .then((res) => res.json())
        .then((data) => {
          const script = document.createElement("script")
          script.src = data.scriptUrl
          script.async = true
          script.defer = true
          document.head.appendChild(script)
        })
        .catch((err) => {
          console.error("Failed to load Google Maps API:", err)
        })
    }
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setMapCenter(location)

          // If we have a map reference, animate to the user's location
          if (mapRef.current) {
            mapRef.current.panTo(location)
            mapRef.current.setZoom(14)
          }
        },
        (error) => {
          console.error("Error getting user location:", error)
        },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
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

  // Handler para clique no mapa
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (selectLocationMode && onLocationSelect && e.latLng) {
      onLocationSelect(e.latLng.lat(), e.latLng.lng());
    }
  };

  if (loadError) {
    return <div className="text-center p-4">Erro ao carregar o mapa. Por favor, tente novamente mais tarde.</div>
  }

  if (!isLoaded) {
    return (
      <div style={{ height }} className="w-full">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    )
  }

  return (
    <div style={{ ...mapContainerStyle, height, background: 'linear-gradient(135deg, #e0e7ff 0%, #fef9c3 100%)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)' }} className="relative border-2 border-blue-200 rounded-2xl overflow-hidden">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height }}
          center={mapCenter}
          zoom={13}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {/* Marker de seleção de localização */}
          {selectLocationMode && marker && (
            <Marker position={marker} />
          )}
          {/* Workshop markers (apenas se não estiver em modo de seleção) */}
          {!selectLocationMode && workshops.map((workshop) => (
            <Marker
              key={workshop.id}
              position={{ lat: workshop.latitude, lng: workshop.longitude }}
              onClick={() => handleMarkerClick(workshop)}
            />
          ))}
          {/* Info window para oficina selecionada */}
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
      ) : (
        <Skeleton className="w-full h-full min-h-[300px]" />
      )}
      {/* Botão de localização do usuário (apenas se não estiver em modo de seleção) */}
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
  );
}
