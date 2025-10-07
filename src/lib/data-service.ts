/**
 * Data fetching and caching utilities for ComparAuto
 */

import { supabase } from './supabase'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Global cache instance
export const dataCache = new DataCache()

// Oficinas data fetching
export interface Oficina {
  id: string
  nome: string
  email: string
  telefone_fixo?: string
  whatsapp: string
  endereco_completo: string
  latitude?: number
  longitude?: number
  avaliacao_media?: number
  total_avaliacoes?: number
  status: 'ativo' | 'inativo' | 'pendente'
  created_at: string
  updated_at: string
}

export interface OficinaDetails extends Oficina {
  servicos: OficinaServico[]
  horarios: OficinaHorario[]
  imagens: OficinaImagem[]
  pagamentos: OficinaPagamento[]
}

export interface OficinaServico {
  id: string
  oficina_id: string
  servico: string
  valor: number
  created_at: string
}

export interface OficinaHorario {
  id: string
  oficina_id: string
  dia_semana: string
  horario_abertura: string
  horario_fechamento: string
}

export interface OficinaImagem {
  id: string
  oficina_id: string
  url_imagem: string
  descricao?: string
  ordem: number
}

export interface OficinaPagamento {
  id: string
  oficina_id: string
  forma_pagamento: string
  pagamento_outros?: string
}

export class OficinaDataService {
  private readonly cachePrefix = 'oficina:'
  private readonly listCacheKey = 'oficinas:list'

  async getOficinas(filters?: {
    status?: string
    cidade?: string
    servico?: string
    limit?: number
    offset?: number
  }): Promise<Oficina[]> {
    const cacheKey = `${this.listCacheKey}:${JSON.stringify(filters || {})}`
    const cached = dataCache.get<Oficina[]>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      let query = supabase.from('oficinas').select('*')

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.cidade) {
        query = query.ilike('endereco_completo', `%${filters.cidade}%`)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Cache for 5 minutes
      dataCache.set(cacheKey, data || [], 5 * 60 * 1000)

      return data || []
    } catch (error) {
      console.error('Error fetching oficinas:', error)
      throw error
    }
  }

  async getOficinaById(id: string): Promise<OficinaDetails | null> {
    const cacheKey = `${this.cachePrefix}${id}`
    const cached = dataCache.get<OficinaDetails>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const { data: oficina, error: oficinaError } = await supabase
        .from('oficinas')
        .select('*')
        .eq('id', id)
        .single()

      if (oficinaError) throw oficinaError
      if (!oficina) return null

      // Fetch related data in parallel
      const [servicosRes, horariosRes, imagensRes, pagamentosRes] = await Promise.all([
        supabase.from('oficina_servicos').select('*').eq('oficina_id', id),
        supabase.from('oficina_horarios').select('*').eq('oficina_id', id),
        supabase.from('oficina_imagens').select('*').eq('oficina_id', id).order('ordem'),
        supabase.from('oficina_pagamentos').select('*').eq('oficina_id', id),
      ])

      if (servicosRes.error) throw servicosRes.error
      if (horariosRes.error) throw horariosRes.error
      if (imagensRes.error) throw imagensRes.error
      if (pagamentosRes.error) throw pagamentosRes.error

      const oficinaDetails: OficinaDetails = {
        ...oficina,
        servicos: servicosRes.data || [],
        horarios: horariosRes.data || [],
        imagens: imagensRes.data || [],
        pagamentos: pagamentosRes.data || [],
      }

      // Cache for 10 minutes
      dataCache.set(cacheKey, oficinaDetails, 10 * 60 * 1000)

      return oficinaDetails
    } catch (error) {
      console.error('Error fetching oficina details:', error)
      throw error
    }
  }

  async searchOficinas(
    query: string,
    filters?: {
      cidade?: string
      servico?: string
      limit?: number
    }
  ): Promise<Oficina[]> {
    const cacheKey = `search:${query}:${JSON.stringify(filters || {})}`
    const cached = dataCache.get<Oficina[]>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      let supabaseQuery = supabase.from('oficinas').select('*').eq('status', 'ativo')

      // Search in name and address
      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(`nome.ilike.%${query}%,endereco_completo.ilike.%${query}%`)
      }

      if (filters?.cidade) {
        supabaseQuery = supabaseQuery.ilike('endereco_completo', `%${filters.cidade}%`)
      }

      if (filters?.limit) {
        supabaseQuery = supabaseQuery.limit(filters.limit)
      }

      const { data, error } = await supabaseQuery.order('nome')

      if (error) throw error

      // Cache for 3 minutes (shorter for search results)
      dataCache.set(cacheKey, data || [], 3 * 60 * 1000)

      return data || []
    } catch (error) {
      console.error('Error searching oficinas:', error)
      throw error
    }
  }

  async getOficinasByServico(servico: string): Promise<Oficina[]> {
    const cacheKey = `servico:${servico}`
    const cached = dataCache.get<Oficina[]>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      // First get oficinas that offer this service
      const { data: servicosData, error: servicosError } = await supabase
        .from('oficina_servicos')
        .select('oficina_id')
        .eq('servico', servico)

      if (servicosError) throw servicosError

      const oficinaIds = servicosData?.map(s => s.oficina_id) || []

      if (oficinaIds.length === 0) {
        return []
      }

      const { data: oficinas, error: oficinasError } = await supabase
        .from('oficinas')
        .select('*')
        .in('id', oficinaIds)
        .eq('status', 'ativo')
        .order('nome')

      if (oficinasError) throw oficinasError

      // Cache for 10 minutes
      dataCache.set(cacheKey, oficinas || [], 10 * 60 * 1000)

      return oficinas || []
    } catch (error) {
      console.error('Error fetching oficinas by servico:', error)
      throw error
    }
  }

  // Cache invalidation methods
  invalidateOficinaCache(id: string): void {
    dataCache.delete(`${this.cachePrefix}${id}`)
    // Also clear list caches
    const keys = Array.from(dataCache['cache'].keys())
    keys.forEach(key => {
      if (key.startsWith(this.listCacheKey) || key.startsWith('search:')) {
        dataCache.delete(key)
      }
    })
  }

  clearAllCache(): void {
    dataCache.clear()
  }
}

// User data service
export interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  tipo: 'cliente' | 'oficina' | 'admin'
  created_at: string
  updated_at: string
}

export class UserDataService {
  private readonly cachePrefix = 'user:'

  async getUserById(id: string): Promise<User | null> {
    const cacheKey = `${this.cachePrefix}${id}`
    const cached = dataCache.get<User>(cacheKey)

    if (cached) {
      return cached
    }

    try {
      // Buscar na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (userError) {
        console.error('Erro ao buscar usuário:', userError)
        return null
      }

      if (userData) {
        // Cache for 15 minutes
        dataCache.set(cacheKey, userData, 15 * 60 * 1000)
      }

      return userData
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  invalidateUserCache(id: string): void {
    dataCache.delete(`${this.cachePrefix}${id}`)
  }
}

// Export service instances
export const oficinaService = new OficinaDataService()
export const userService = new UserDataService()

// React hooks for data fetching
export function useOficinaData() {
  return {
    getOficinas: oficinaService.getOficinas.bind(oficinaService),
    getOficinaById: oficinaService.getOficinaById.bind(oficinaService),
    searchOficinas: oficinaService.searchOficinas.bind(oficinaService),
    getOficinasByServico: oficinaService.getOficinasByServico.bind(oficinaService),
  }
}

export function useUserData() {
  return {
    getUserById: userService.getUserById.bind(userService),
  }
}
