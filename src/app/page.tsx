'use client'

import {
  Search,
  X,
  Wrench,
  Star,
  Shield,
  Clock,
  Award,
  Filter,
  SlidersHorizontal,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import OfficeCard from '@/components/OfficeCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

interface UserData {
  nome?: string
  email?: string
  role?: string
  photoURL?: string
}

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

// Função para remover acentos e normalizar strings
const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function Home() {
  const [, setUserData] = useState<UserData | null>(null)
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredOficinas, setFilteredOficinas] = useState<Oficina[]>([])
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error('Error fetching user:', authError)
        setUserData(null)
        setLoading(false)
        return
      }

      if (user) {
        try {
          const { data: userDoc, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single()

          if (userError) {
            console.error('Error fetching user data:', userError)
          } else {
            setUserData(userDoc as UserData)
          }
        } catch (error) {
          console.error('Unexpected error fetching user data:', error)
        }
      } else {
        setUserData(null)
      }
      setLoading(false)
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    async function fetchOficinas() {
      try {
        console.log('Iniciando busca de oficinas...')

        const { data: testConnection, error: connectionError } = await supabase
          .from('oficinas')
          .select('count', { count: 'exact', head: true })

        if (connectionError) {
          console.error('Erro de conexão com Supabase:', connectionError)
          setOficinas([])
          setLoading(false)
          return
        }

        console.log('Conexão com Supabase OK. Registros encontrados:', testConnection)

        const { data, error } = await supabase.from('oficinas').select('*').eq('status', 'ativo')

        if (error) {
          console.error('Erro detalhado ao buscar oficinas:', error)
          setOficinas([])
        } else {
          console.log('Dados brutos encontrados:', data)
          const oficinasAtivas = (data as Oficina[]) || []
          console.log('Oficinas ativas encontradas:', oficinasAtivas.length)
          console.log(
            'Oficinas com serviços:',
            oficinasAtivas.map(o => ({
              nome: o.nome,
              servicos: o.servicos_oferecidos,
            }))
          )
          setOficinas(oficinasAtivas)
        }
      } catch (err) {
        console.error('Erro inesperado ao buscar oficinas:', err)
        setOficinas([])
      } finally {
        setLoading(false)
      }
    }

    fetchOficinas()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    let filtered = oficinas
    if (debouncedSearchTerm) {
      const term = removeAccents(debouncedSearchTerm)
      filtered = filtered.filter(oficina => {
        // Busca no nome da oficina (sem acentos)
        const matchNome = oficina.nome && removeAccents(oficina.nome).includes(term)

        // Busca no endereço (sem acentos)
        const matchEndereco = oficina.endereco && removeAccents(oficina.endereco).includes(term)

        // Busca na cidade (sem acentos)
        const matchCidade = oficina.cidade && removeAccents(oficina.cidade).includes(term)

        // Busca no estado (sem acentos)
        const matchEstado = oficina.estado && removeAccents(oficina.estado).includes(term)

        // Busca nos serviços oferecidos (sem acentos)
        const matchServicos = oficina.servicos_oferecidos?.some(servico =>
          removeAccents(servico).includes(term)
        )

        return matchNome || matchEndereco || matchCidade || matchEstado || matchServicos
      })
    }
    if (selectedCategory) {
      // Mapear o ID da categoria para o nome do serviço
      const categoryMap: Record<string, string> = {
        'troca-oleo': 'Troca de óleo',
        avaliacao: 'Avaliação',
        pelicula: 'Película',
        filtros: 'Filtros',
        alinhamento: 'Alinhamento e balanceamento',
        pastilhas: 'Pastilhas',
        polimento: 'Polimento',
        acessorios: 'Acessórios',
        'ar-condicionado': 'Ar-condicionado',
        higienizacao: 'Higienização',
        'mecanica-geral': 'Mecânica geral',
        eletrica: 'Elétrica',
        freios: 'Freios',
        suspensao: 'Suspensão',
        escape: 'Sistema de escape',
        bateria: 'Bateria',
        pneus: 'Pneus',
        injecao: 'Injeção eletrônica',
      }

      const servicoNome = categoryMap[selectedCategory]
      if (servicoNome) {
        const servicoNormalizado = removeAccents(servicoNome)
        filtered = filtered.filter(oficina =>
          oficina.servicos_oferecidos?.some(servico =>
            removeAccents(servico).includes(servicoNormalizado)
          )
        )
      }
    }
    setFilteredOficinas(filtered)
  }, [debouncedSearchTerm, selectedCategory, oficinas])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-white">
          <div className="space-y-6 text-center">
            <div className="relative mx-auto h-20 w-20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-blue-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Carregando oficinas</h2>
              <p className="text-gray-600">Encontrando as melhores opções para você</p>
            </div>
          </div>
        </main>
        <Footer />{' '}
      </div>
    )
  }

  // Optimized categories data for mobile performance
  const categories = [
    { id: 'troca-oleo', name: 'Troca de óleo', icon: '/oleo.png' },
    { id: 'avaliacao', name: 'Avaliação', icon: '/avaliacao.png' },
    { id: 'pelicula', name: 'Película', icon: '/pelicula.png' },
    { id: 'filtros', name: 'Filtros', icon: '/filtro.png' },
    { id: 'alinhamento', name: 'Alinhamento', icon: '/balanceamento.png' },
    { id: 'pastilhas', name: 'Pastilhas', icon: '/freio.png' },
    { id: 'polimento', name: 'Polimento', icon: '/polimento.png' },
    { id: 'acessorios', name: 'Acessórios', icon: '/acessorios.png' },
    { id: 'ar-condicionado', name: 'Ar-condicionado', icon: '/ar-condicionado.png' },
    { id: 'higienizacao', name: 'Higienização', icon: '/higienizacao.png' },
    { id: 'mecanica-geral', name: 'Mecânica Geral', icon: '/oleo.png' },
    { id: 'eletrica', name: 'Elétrica', icon: '/eletrica.png' },
    { id: 'freios', name: 'Freios', icon: '/freio.png' },
    { id: 'suspensao', name: 'Suspensão', icon: '/susp.png' },
    { id: 'escape', name: 'Escape', icon: '/escape.png' },
    { id: 'bateria', name: 'Bateria', icon: '/bateria.png' },
    { id: 'pneus', name: 'Pneus', icon: '/balanceamento.png' },
    { id: 'injecao', name: 'Injeção', icon: '/injecao.png' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Hero Section - Modern Marketplace Style */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-extrabold leading-tight text-gray-900 md:text-7xl">
              Encontre a oficina
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                perfeita para seu carro
              </span>
            </h1>
            <p className="mx-auto mb-12 max-w-3xl text-xl font-light text-gray-600 md:text-2xl">
              Marketplace de oficinas automotivas. Compare serviços, preços e avaliações em um só
              lugar.
            </p>

            {/* Search Bar - Modern Marketplace Design */}
            <div className="mx-auto mb-16 max-w-3xl">
              <div className="group relative">
                <div className="flex items-center overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-xl transition-all duration-300 hover:border-blue-300">
                  <div className="flex flex-1 items-center px-8 py-5">
                    <Search className="mr-4 h-6 w-6 flex-shrink-0 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Busque por serviço, oficina ou cidade..."
                      className="flex-1 border-none bg-transparent p-0 text-lg shadow-none outline-none placeholder:text-gray-400"
                      value={searchTerm}
                      onChange={handleSearch}
                      style={{ boxShadow: 'none' }}
                    />
                    {searchTerm && (
                      <button
                        className="ml-4 rounded-full p-2 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <Button className="m-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-5 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700">
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Section - Modern Cards */}
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{oficinas.length}+</div>
                <div className="text-sm font-medium text-gray-600">Oficinas Ativas</div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">4.8★</div>
                <div className="text-sm font-medium text-gray-600">Avaliação Média</div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">24h</div>
                <div className="text-sm font-medium text-gray-600">Suporte</div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm font-medium text-gray-600">Segurança</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Serviços Disponíveis</h2>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          <div className="relative">
            {/* Categories container */}
            <div
              id="categories-container"
              className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9"
            >
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`
                    group flex flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-300
                    ${
                      selectedCategory === category.id
                        ? 'scale-105 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl'
                        : 'border border-gray-200 bg-white text-gray-700 shadow-md hover:border-blue-300 hover:bg-gray-50 hover:shadow-xl'
                    }
                  `}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div
                    className={`
                      relative rounded-xl p-3 transition-all duration-300
                      ${
                        selectedCategory === category.id
                          ? 'bg-white/20'
                          : 'bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-purple-50'
                      }
                    `}
                  >
                    <Image
                      src={category.icon || '/placeholder.svg'}
                      alt={category.name}
                      width={32}
                      height={32}
                      className={`h-8 w-8 transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'brightness-0 invert'
                          : 'group-hover:scale-110'
                      }`}
                    />
                  </div>
                  <span className="text-center text-xs font-semibold leading-tight">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active filters */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {selectedCategory && (
                <Badge className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
                  <Filter className="h-3 w-3" />
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge className="flex items-center gap-2 bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-lg">
                  <Search className="h-3 w-3" />
                  {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Limpar todos
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Results header */}
          {filteredOficinas.length > 0 && (
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  {filteredOficinas.length}{' '}
                  {filteredOficinas.length === 1 ? 'oficina encontrada' : 'oficinas encontradas'}
                </h2>
                <p className="text-lg text-gray-600">
                  {selectedCategory
                    ? `Especialistas em ${categories.find(c => c.id === selectedCategory)?.name}`
                    : 'Todas as oficinas disponíveis para você'}
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Ordenar
              </Button>
            </div>
          )}

          {/* Office Cards Grid */}
          {filteredOficinas.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOficinas.map((oficina, index) => (
                <div
                  key={oficina.id}
                  className="transform animate-fade-in-up transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <OfficeCard oficina={oficina} />
                </div>
              ))}
            </div>
          )}

          {/* No results state */}
          {filteredOficinas.length === 0 && (
            <div className="py-32 text-center">
              <div className="mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white p-12 shadow-2xl">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-4 text-3xl font-bold text-gray-900">
                  Nenhuma oficina encontrada
                </h3>
                <p className="mb-8 text-lg leading-relaxed text-gray-600">
                  Não encontramos oficinas que correspondam aos seus critérios de busca. Tente
                  ajustar os filtros ou explorar outras categorias.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    Limpar filtros
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                    className="px-10 py-4 text-lg font-semibold"
                  >
                    Ver todas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
