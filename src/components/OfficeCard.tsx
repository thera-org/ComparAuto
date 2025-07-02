import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, Heart, Star } from "lucide-react"

interface Oficina {
  id: string
  nome: string
  endereco: string
  telefone?: string
  horario_funcionamento?: string
  foto_url?: string
  servicos?: string[]
  latitude: number
  longitude: number
}

interface OfficeCardProps {
  oficina: Oficina
}

export default function OfficeCard({ oficina }: OfficeCardProps) {
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
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-white/50">
            <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
          </button>

          {/* Status Badge */}
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Online
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
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
            <span className="text-sm font-semibold text-gray-900">4.8</span>
            <span className="text-sm text-gray-500">(127 avaliações)</span>
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
}