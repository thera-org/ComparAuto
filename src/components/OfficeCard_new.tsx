"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Heart, Star } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface Oficina {
  id: string
  nome: string
  endereco: string
  latitude: number
  longitude: number
  foto_url?: string
  telefone?: string
  status?: string
  category?: string
}

interface OfficeCardProps {
  oficina: Oficina
  index: number
}

export default function OfficeCard({ oficina, index }: OfficeCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before card enters viewport
        threshold: 0.1
      }
    )

    const currentCardRef = cardRef.current
    if (currentCardRef) {
      observer.observe(currentCardRef)
    }

    return () => {
      if (currentCardRef) {
        observer.unobserve(currentCardRef)
      }
    }
  }, [])

  return (
    <Link href={`/oficina/${oficina.id}`}>
      <div 
        ref={cardRef}
        className="group cursor-pointer hover-lift card-hover-glow"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 backdrop-blur-sm h-full">
          {/* Horizontal Layout */}
          <div className="flex h-full">
            {/* Image Section - Left Side */}
            <div className="relative w-1/3 min-h-[200px] overflow-hidden">
              {/* Image with lazy loading */}
              {isVisible ? (
                <>
                  <Image
                    src={oficina.foto_url || "/placeholder.svg"}
                    alt={oficina.nome || "Oficina"}
                    fill
                    className={`object-cover group-hover:scale-110 transition-all duration-700 ${
                      isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setIsImageLoaded(true)}
                    loading="lazy"
                  />
                  
                  {/* Loading skeleton */}
                  {!isImageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 loading-skeleton"></div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 loading-skeleton"></div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs px-2 py-1 shadow-lg backdrop-blur-sm border-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></div>
                  Online
                </Badge>
              </div>

              {/* Rating Badge */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg">
                <div className="flex items-center">
                  <Star className="h-3 w-3 fill-current text-yellow-500 mr-1" />
                  <span className="text-xs font-bold text-gray-800">4.8</span>
                </div>
              </div>
            </div>

            {/* Content Section - Right Side */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight text-lg group-hover:text-blue-600 transition-colors duration-300 mb-2">
                      {oficina.nome}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{oficina.endereco}</span>
                    </p>
                  </div>
                  
                  {/* Favorite Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 bg-gray-50 hover:bg-gray-100 hover:scale-110 transition-all duration-300 shadow-sm favorite-btn border-0 ml-3"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle favorite logic here
                    }}
                  >
                    <Heart className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" />
                  </Button>
                </div>

                {/* Service Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Troca de óleo
                  </span>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                    Revisão
                  </span>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                    Alinhamento
                  </span>
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-gray-500 text-xs">A partir de</p>
                  <p className="text-blue-600 font-bold text-lg">R$ 50</p>
                </div>
                <div className="text-sm text-blue-600 font-medium group-hover:underline">
                  Ver detalhes →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
