/**
 * @jest-environment node
 */
// src/app/api/oficinas/__tests__/route.test.ts

// Mock must be at the top before importing the module under test
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}))

import { NextRequest } from 'next/server'
import { GET } from '../route'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const mockOficinas = [
  {
    id: '1', nome: 'Oficina A', status: 'ativo',
    endereco_completo: 'Rua A, 100, SP',
    latitude: -23.56, longitude: -46.65,
    avaliacao_media: 4.9, total_avaliacoes: 100,
    destaque: true, destaque_ate: '2099-01-01T00:00:00Z',
    oficina_horarios: [{ dia_semana: 'sabado', horario_abertura: '08:00', horario_fechamento: '18:00' }],
    oficina_servicos: [{ servico: 'Troca de óleo', valor: 79 }],
    oficina_imagens: [{ url_imagem: 'https://example.com/a.jpg', ordem: 1 }],
  },
  {
    id: '2', nome: 'Oficina B', status: 'ativo',
    endereco_completo: 'Rua B, 200, SP',
    latitude: -23.57, longitude: -46.66,
    avaliacao_media: 4.5, total_avaliacoes: 30,
    destaque: false, destaque_ate: null,
    oficina_horarios: [],
    oficina_servicos: [{ servico: 'Troca de óleo', valor: 65 }],
    oficina_imagens: [],
  },
]

function makeSupabaseMock(data: typeof mockOficinas) {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data, error: null }),
  }
  return {
    from: jest.fn().mockReturnValue(queryBuilder),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(
    makeSupabaseMock(mockOficinas)
  )
})

describe('GET /api/oficinas', () => {
  it('retorna status 200 com lista de oficinas', async () => {
    const req = new NextRequest('http://localhost/api/oficinas?servico=Troca+de+%C3%B3leo&lat=-23.56&lng=-46.65')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.oficinas).toHaveLength(2)
  })

  it('oficina com destaque ativo aparece primeiro', async () => {
    const req = new NextRequest('http://localhost/api/oficinas?servico=Troca+de+%C3%B3leo&lat=-23.56&lng=-46.65')
    const res = await GET(req)
    const json = await res.json()
    expect(json.oficinas[0].id).toBe('1')
  })

  it('inclui distanceKm numérico em cada oficina', async () => {
    const req = new NextRequest('http://localhost/api/oficinas?servico=Troca+de+%C3%B3leo&lat=-23.56&lng=-46.65')
    const res = await GET(req)
    const json = await res.json()
    expect(typeof json.oficinas[0].distanceKm).toBe('number')
  })

  it('inclui isOpen boolean em cada oficina', async () => {
    const req = new NextRequest('http://localhost/api/oficinas?servico=Troca+de+%C3%B3leo&lat=-23.56&lng=-46.65')
    const res = await GET(req)
    const json = await res.json()
    expect(typeof json.oficinas[0].isOpen).toBe('boolean')
  })

  it('funciona sem lat/lng (sem ranking por proximidade)', async () => {
    const req = new NextRequest('http://localhost/api/oficinas?servico=Troca+de+%C3%B3leo')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('retorna 500 se Supabase retornar erro', async () => {
    ;(createSupabaseServerClient as jest.Mock).mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    })
    const req = new NextRequest('http://localhost/api/oficinas')
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
