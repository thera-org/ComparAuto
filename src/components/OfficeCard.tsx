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
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 h-80 flex flex-col">
      <Link href={`/oficina/${oficina.id}`} className="h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
          <Image
            src={oficina.foto_url || "/placeholder.svg"}
            alt={oficina.nome}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Heart/Favorite Button */}
          <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>
        </div>
        
        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {oficina.nome}
          </h3>
          
          {/* Location */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 line-clamp-2">{oficina.endereco}</span>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900">4.8</span>
            <span className="text-sm text-gray-500">(127 avaliações)</span>
          </div>
            {/* Services Tags */}
          <div className="flex flex-wrap gap-1 mb-3 flex-1">
            {(oficina.servicos || ['Mecânica', 'Elétrica']).slice(0, 2).map((servico, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {servico}
              </span>
            ))}
            {(oficina.servicos?.length || 2) > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                +{(oficina.servicos?.length || 2) - 2}
              </span>
            )}
          </div>
          
          {/* Price/Contact Info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">Contato</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">Ver detalhes</span>
          </div>
        </div>
      </Link>
    </div>
  )
}