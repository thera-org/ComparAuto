import { MapPin, Phone, Heart, Star, Clock, Verified } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

interface Oficina {
  id: string
  nome: string
  endereco: string
  latitude?: number
  longitude?: number
  foto_url?: string
  telefone?: string
  status?: string
  category?: string
  servicos?: string[]
  avaliacao?: number
  totalAvaliacoes?: number
  isVerified?: boolean
  horarioFuncionamento?: string
}

interface OfficeCardProps {
  oficina: Oficina
  onFavoriteClick?: (id: string) => void
  isFavorite?: boolean
  showDistance?: boolean
  distance?: number
}

const OfficeCard = memo(function OfficeCard({
  oficina,
  onFavoriteClick,
  isFavorite = false,
  showDistance = false,
  distance,
}: OfficeCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavoriteClick?.(oficina.id)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800'
      case 'ocupado':
        return 'bg-yellow-100 text-yellow-800'
      case 'fechado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="group flex h-96 transform-gpu flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-200 hover:shadow-2xl">
      <Link href={`/oficina/${oficina.id}`} className="flex h-full flex-col">
        {/* Image Section */}
        <div className="relative h-48 w-full flex-shrink-0 overflow-hidden">
          <Image
            src={oficina.foto_url || '/placeholder.svg'}
            alt={oficina.nome}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

          {/* Heart/Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-current text-red-500' : 'text-gray-600 hover:text-red-500'}`}
            />
          </button>

          {/* Status Badge */}
          <div className="absolute left-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
              {oficina.status || 'Online'}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col bg-white p-5">
          {/* Title */}
          <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-tight text-gray-900 transition-colors group-hover:text-blue-600">
            {oficina.nome}
          </h3>

          {/* Location */}
          <div className="mb-4 flex items-start gap-2">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-blue-500" />
            <span className="line-clamp-2 text-sm leading-relaxed text-gray-600">
              {oficina.endereco}
            </span>
          </div>

          {/* Rating */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-1">{renderStars(oficina.avaliacao || 5)}</div>
            <span className="text-sm font-semibold text-gray-900">
              {oficina.avaliacao || '4.8'}
            </span>
            <span className="text-sm text-gray-500">
              ({oficina.totalAvaliacoes || '127'} avaliações)
            </span>
          </div>

          {/* Services Tags */}
          <div className="mb-4 flex flex-1 flex-wrap gap-2">
            {(oficina.servicos || ['Mecânica Geral', 'Elétrica', 'Ar-condicionado'])
              .slice(0, 3)
              .map((servico, index) => (
                <span
                  key={index}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {servico}
                </span>
              ))}
            {(oficina.servicos?.length || 3) > 3 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                +{(oficina.servicos?.length || 3) - 3} mais
              </span>
            )}
          </div>

          {/* Price/Contact Info */}
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Disponível</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-blue-600 transition-colors group-hover:text-blue-700">
              <span className="text-sm">Ver detalhes</span>
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
})

export default OfficeCard
