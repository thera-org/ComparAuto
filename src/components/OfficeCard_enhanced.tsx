import Image from "next/image"
import Link from "next/link"
import { memo } from "react"
import { MapPin, Phone, Heart, Star, Clock, Verified } from "lucide-react"

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
    <Link href={`/oficina/${oficina.id}`} className="block group">
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-gray-100">
          {oficina.foto_url ? (
            <Image
              src={oficina.foto_url}
              alt={`Foto da ${oficina.nome}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8" />
                </div>
                <p className="text-sm">Sem foto</p>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {oficina.isVerified && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Verified className="w-3 h-3" />
                Verificado
              </div>
            )}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(oficina.status)}`}>
              {oficina.status === 'ativo' ? 'Aberto' : oficina.status || 'Fechado'}
            </div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart 
              className={`w-5 h-5 ${
                isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
              }`} 
            />
          </button>

          {/* Distance */}
          {showDistance && distance && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
              {distance.toFixed(1)} km
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
              {oficina.nome}
            </h3>
          </div>

          {/* Rating */}
          {oficina.avaliacao && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {renderStars(oficina.avaliacao)}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {oficina.avaliacao.toFixed(1)}
              </span>
              {oficina.totalAvaliacoes && (
                <span className="text-sm text-gray-500">
                  ({oficina.totalAvaliacoes} avaliações)
                </span>
              )}
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-2 mb-3 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm line-clamp-2">{oficina.endereco}</p>
          </div>

          {/* Services */}
          {oficina.servicos && oficina.servicos.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {oficina.servicos.slice(0, 3).map((servico, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                >
                  {servico}
                </span>
              ))}
              {oficina.servicos.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                  +{oficina.servicos.length - 3} mais
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {/* Contact */}
            {oficina.telefone && (
              <div className="flex items-center gap-1 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{oficina.telefone}</span>
              </div>
            )}

            {/* Working Hours */}
            {oficina.horarioFuncionamento && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{oficina.horarioFuncionamento}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
})

export default OfficeCard
