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
    <Link href={`/oficina/${oficina.id}`} className="group block">
      <article className="transform overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-gray-100">
          {oficina.foto_url ? (
            <Image
              src={oficina.foto_url}
              alt={`Foto da ${oficina.nome}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                  <MapPin className="h-8 w-8" />
                </div>
                <p className="text-sm">Sem foto</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            {oficina.isVerified && (
              <div className="flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                <Verified className="h-3 w-3" />
                Verificado
              </div>
            )}
            <div
              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(oficina.status)}`}
            >
              {oficina.status === 'ativo' ? 'Aberto' : oficina.status || 'Fechado'}
            </div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-600'}`}
            />
          </button>

          {/* Distance */}
          {showDistance && distance && (
            <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
              {distance.toFixed(1)} km
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Rating */}
          <div className="mb-2 flex items-start justify-between">
            <h3 className="line-clamp-2 flex-1 font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {oficina.nome}
            </h3>
          </div>

          {/* Rating */}
          {oficina.avaliacao && (
            <div className="mb-2 flex items-center gap-2">
              <div className="flex items-center">{renderStars(oficina.avaliacao)}</div>
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
          <div className="mb-3 flex items-start gap-2 text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="line-clamp-2 text-sm">{oficina.endereco}</p>
          </div>

          {/* Services */}
          {oficina.servicos && oficina.servicos.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {oficina.servicos.slice(0, 3).map((servico, index) => (
                <span
                  key={index}
                  className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {servico}
                </span>
              ))}
              {oficina.servicos.length > 3 && (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  +{oficina.servicos.length - 3} mais
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            {/* Contact */}
            {oficina.telefone && (
              <div className="flex items-center gap-1 text-gray-600">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{oficina.telefone}</span>
              </div>
            )}

            {/* Working Hours */}
            {oficina.horarioFuncionamento && (
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-4 w-4" />
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
