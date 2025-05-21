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
}

const mapContainerStyle = {
  width: "100%",
  borderRadius: "0.5rem",
}

const defaultCenter = { lat: -23.5505, lng: -46.6333 } // São Paulo as default

export default function WorkshopMap({
  initialCenter,
  workshops: initialWorkshops,
  height = "500px",
  onWorkshopSelect,
}: WorkshopMapProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>(initialWorkshops || [])
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState(initialCenter || defaultCenter)
  const [loading, setLoading] = useState(!initialWorkshops)
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', // We'll load the API key from a script tag instead
    libraries: ["places"],
  })

  const fetchWorkshops = useCallback(async () => {
    if (initialWorkshops) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("oficinas")
        .select("id, nome, endereco, latitude, longitude, foto_url, telefone")
        .not("latitude", "is", null)
        .not("longitude", "is", null)

      if (error) throw error
      setWorkshops(data || [])
    } catch (error) {
      console.error("Error fetching workshops:", error)
    } finally {
      setLoading(false)
    }
  }, [initialWorkshops])

  useEffect(() => {
    fetchWorkshops()
  }, [fetchWorkshops])

  useEffect(() => {
    if (initialWorkshops) {
      setWorkshops(initialWorkshops)
    }
  }, [initialWorkshops])

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
          setUserLocation(location)
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
    <div className="relative">
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height }}
        center={mapCenter}
        zoom={13}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        )}

        {/* Workshop markers */}
        {workshops.map((workshop) => (
          <Marker
            key={workshop.id}
            position={{ lat: workshop.latitude, lng: workshop.longitude }}
            onClick={() => handleMarkerClick(workshop)}
          />
        ))}

        {/* Info window for selected workshop */}
        {selectedWorkshop && (
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

      {/* Location button */}
      <Button
        onClick={getUserLocation}
        className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-100 shadow-md"
        size="sm"
      >
        <Navigation className="h-4 w-4 mr-2" />
        Minha Localização
      </Button>
    </div>
  )
}
