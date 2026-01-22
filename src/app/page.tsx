'use client'

import { Search, X, Wrench, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import OfficeCard from '@/components/OfficeCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface Oficina {
  id: string
  nome: string
  endereco: string
  foto_url?: string
  telefone?: string
  status?: string
  servicos_oferecidos?: string[]
  cidade?: string
  estado?: string
}

const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function Home() {
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredOficinas, setFilteredOficinas] = useState<Oficina[]>([])
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    async function fetchOficinas() {
      try {
        const { data, error } = await supabase.from('oficinas').select('*').eq('status', 'ativo')
        if (error) {
          setOficinas([])
        } else {
          setOficinas((data as Oficina[]) || [])
        }
      } catch {
        setOficinas([])
      } finally {
        setLoading(false)
      }
    }
    fetchOficinas()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    let filtered = oficinas
    if (debouncedSearchTerm) {
      const term = removeAccents(debouncedSearchTerm)
      filtered = filtered.filter(oficina => {
        const matchNome = oficina.nome && removeAccents(oficina.nome).includes(term)
        const matchEndereco = oficina.endereco && removeAccents(oficina.endereco).includes(term)
        const matchCidade = oficina.cidade && removeAccents(oficina.cidade).includes(term)
        const matchServicos = oficina.servicos_oferecidos?.some(s => removeAccents(s).includes(term))
        return matchNome || matchEndereco || matchCidade || matchServicos
      })
    }
    if (selectedCategory) {
      const categoryMap: Record<string, string> = {
        mecanica: 'Mecânica',
        eletrica: 'Elétrica',
        lanternagem: 'Lanternagem',
        performance: 'Performance',
        populares: 'Populares',
      }
      const servicoNome = categoryMap[selectedCategory]
      if (servicoNome) {
        const norm = removeAccents(servicoNome)
        filtered = filtered.filter(o =>
          o.servicos_oferecidos?.some(s => removeAccents(s).includes(norm))
        )
      }
    }
    setFilteredOficinas(filtered)
  }, [debouncedSearchTerm, selectedCategory, oficinas])

  const handleCategorySelect = (id: string) => setSelectedCategory(selectedCategory === id ? null : id)
  const clearFilters = () => { setSearchTerm(''); setSelectedCategory(null) }

  const mainCategories = [
    { id: 'mecanica', name: 'Mecânica', icon: 'build' },
    { id: 'eletrica', name: 'Elétrica', icon: 'bolt' },
    { id: 'lanternagem', name: 'Lanternagem', icon: 'auto_fix_high' },
    { id: 'performance', name: 'Performance', icon: 'speed' },
    { id: 'populares', name: 'Populares', icon: 'star' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-800 font-sans antialiased">
      <Header />

      {/* Spacer for fixed header */}
      <div className="pt-24 md:pt-20"></div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-8">
              {mainCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex flex-col items-center gap-1 pb-2 transition-all ${
                    selectedCategory === cat.id
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="material-icons-outlined text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" className="gap-2 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full px-6 py-8">
        <div 
          className="relative h-[400px] overflow-hidden rounded-3xl bg-cover bg-center mx-auto"
          style={{ backgroundImage: 'url(/hero-bg.jpg)', maxWidth: '1400px' }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 h-full flex flex-col justify-center px-12">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">Sua oficina ideal</h1>
            <p className="mb-10 max-w-lg text-xl text-white">
              Conectamos você à oficina perfeita para seu veículo.
            </p>
            <Link
              href="#oficinas"
              className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Encontrar Oficina
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">Oficinas Parceiras</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">4.8★</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">Avaliação Média</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50k+</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">Clientes Satisfeitos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">Garantia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {(searchTerm || selectedCategory) && (
        <div className="bg-gray-50 py-4">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm">
                  <Search className="h-3 w-3" />
                  {mainCategories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory(null)} className="ml-1 rounded-full p-0.5 hover:bg-gray-100">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm">
                  <Search className="h-3 w-3" />
                  &quot;{searchTerm}&quot;
                  <button onClick={() => setSearchTerm('')} className="ml-1 rounded-full p-0.5 hover:bg-gray-100">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">
                Limpar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="oficinas" className="flex-1 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="py-12">
              <div className="mb-8">
                <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
                <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100"></div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="rounded-2xl bg-gray-100 p-4">
                    <div className="aspect-[4/3] animate-pulse rounded-xl bg-gray-200"></div>
                    <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {filteredOficinas.length > 0 && (
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="mb-1 text-xl font-semibold text-gray-900">
                      {filteredOficinas.length} {filteredOficinas.length === 1 ? 'oficina encontrada' : 'oficinas encontradas'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedCategory
                        ? `Especialistas em ${mainCategories.find(c => c.id === selectedCategory)?.name}`
                        : 'Todas as oficinas disponíveis na sua região'}
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2 rounded-xl border-gray-300 text-gray-700">
                    <SlidersHorizontal className="h-4 w-4" />
                    Ordenar
                  </Button>
                </div>
              )}

              {filteredOficinas.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredOficinas.map((oficina, index) => (
                    <div key={oficina.id} className="transform transition-all hover:scale-[1.02]" style={{ animationDelay: `${index * 0.05}s` }}>
                      <OfficeCard oficina={oficina} />
                    </div>
                  ))}
                </div>
              )}

              {filteredOficinas.length === 0 && (
                <div className="py-24 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                      <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">Nenhuma oficina encontrada</h3>
                    <p className="mb-6 text-gray-500">Não encontramos oficinas que correspondam aos seus critérios.</p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={clearFilters} className="bg-primary text-white hover:bg-rose-600">
                        Limpar filtros
                      </Button>
                      <Button variant="outline" onClick={() => setSearchTerm('')} className="border-gray-300">
                        Ver todas
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
