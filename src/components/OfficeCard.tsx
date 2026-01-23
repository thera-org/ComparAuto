import { MapPin, Heart, Star } from 'lucide-react'
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
  servicos_oferecidos?: string[]
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
}: OfficeCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavoriteClick?.(oficina.id)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl transition-all hover:shadow-lg">
      <Link href={`/oficina/${oficina.id}`} className="flex flex-col">
        {/* Image Section - Airbnb Style */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
          <Image
            src={oficina.foto_url || '/placeholder.svg'}
            alt={oficina.nome}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Heart/Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute right-3 top-3 p-2 transition-transform hover:scale-110"
          >
            <Heart
              className={`h-6 w-6 drop-shadow-md transition-colors ${
                isFavorite
                  ? 'fill-primary text-primary'
                  : 'fill-black/50 text-white hover:fill-primary hover:text-primary'
              }`}
            />
          </button>

          {/* Verified Badge */}
          {oficina.isVerified && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm">
              <span className="material-icons text-sm text-primary">verified</span>
              Verificada
            </div>
          )}
        </div>

        {/* Content Section - Airbnb Style */}
        <div className="flex flex-col pt-3">
          {/* Title and Rating Row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold  text-gray-900">{oficina.nome}</h3>
            <div className="flex flex-shrink-0 items-center gap-1">
              <Star className="h-4 w-4 fill-current text-gray-900 " />
              <span className="text-sm font-medium text-gray-900 ">
                {oficina.avaliacao || '4.92'}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gray-500 " />
            <span className="line-clamp-1 text-sm  text-gray-500">{oficina.endereco}</span>
          </div>

          {/* Services */}
          <p className="mt-1 line-clamp-1  text-sm text-gray-500">
            {oficina.servicos_oferecidos && oficina.servicos_oferecidos.length > 0
              ? oficina.servicos_oferecidos.slice(0, 2).join(' · ')
              : 'Mecânica Geral'}
          </p>

          {/* Price */}
          <div className="mt-2">
            <span className="font-semibold text-gray-900 ">R$ 150</span>
            <span className="text-sm  text-gray-500"> / hora</span>
          </div>
        </div>
      </Link>
    </div>
  )
})

export default OfficeCard
