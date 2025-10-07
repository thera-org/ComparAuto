import { MapPin, Phone, Heart, Star, Clock, Verified } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { memo } from "react"

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
  distance 
}: OfficeCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavoriteClick?.(oficina.id)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'ocupado': return 'bg-yellow-100 text-yellow-800'
      case 'fechado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 h-96 flex flex-col hover:scale-105 transform-gpu">
      <Link href={`/oficina/${oficina.id}`} className="h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
          <Image
            src={oficina.foto_url || "/placeholder.svg"}
            alt={oficina.nome}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Heart/Favorite Button */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-white/50"
          >
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'}`} />
          </button>

          {/* Status Badge */}
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              {oficina.status || 'Online'}
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1 bg-white">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {oficina.nome}
          </h3>
          
          {/* Location */}
          <div className="flex items-start gap-2 mb-4">
            <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
            <span className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{oficina.endereco}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {renderStars(oficina.avaliacao || 5)}
            </div>
            <span className="text-sm font-semibold text-gray-900">{oficina.avaliacao || '4.8'}</span>
            <span className="text-sm text-gray-500">({oficina.totalAvaliacoes || '127'} avaliações)</span>
          </div>

          {/* Services Tags */}
          <div className="flex flex-wrap gap-2 mb-4 flex-1">
            {(oficina.servicos || ['Mecânica Geral', 'Elétrica', 'Ar-condicionado']).slice(0, 3).map((servico, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100"
              >
                {servico}
              </span>
            ))}
            {(oficina.servicos?.length || 3) > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                +{(oficina.servicos?.length || 3) - 3} mais
              </span>
            )}
          </div>
          
          {/* Price/Contact Info */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 font-medium">Disponível</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
              <span className="text-sm">Ver detalhes</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
})

export default OfficeCard
