'use client'

interface OfficeDetailMapProps {
  latitude: number
  longitude: number
  nome: string
  endereco: string
}

export default function OfficeDetailMap({
  latitude,
  longitude,
  nome,
  endereco,
}: OfficeDetailMapProps) {
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
        <p className="text-sm font-medium text-gray-700">{nome}</p>
        <p className="text-xs text-gray-500">{endereco}</p>
        <p className="text-xs text-blue-600">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      </div>
    </div>
  )
}
