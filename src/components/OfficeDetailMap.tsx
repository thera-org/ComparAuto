'use client'

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'

interface OfficeDetailMapProps {
  latitude: number
  longitude: number
  nome: string
  endereco: string
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
}

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true,
  disableDefaultUI: false,
}

export default function OfficeDetailMap({
  latitude,
  longitude,
  nome,
  endereco,
}: OfficeDetailMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  if (loadError) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
        <div className="space-y-2 text-center">
          <div className="text-gray-600">
            <svg
              className="mx-auto mb-2 h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Erro ao carregar mapa</p>
          <p className="text-xs text-gray-500">{endereco}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
        <div className="space-y-2 text-center">
          <div className="text-gray-600">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <p className="text-sm font-medium text-gray-700">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  const center = {
    lat: latitude || -2.5307,
    lng: longitude || -44.3068,
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={mapOptions}
      >
        {latitude && longitude && (
          <Marker
            position={center}
            title={nome}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
          />
        )}
      </GoogleMap>
    </div>
  )
}
