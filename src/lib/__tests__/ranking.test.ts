// src/lib/__tests__/ranking.test.ts
import { haversineDistance, isOficinaOpen, calculateRankingScore } from '../ranking'

describe('haversineDistance', () => {
  it('retorna 0 para mesma localização', () => {
    expect(haversineDistance(-23.5, -46.6, -23.5, -46.6)).toBe(0)
  })

  it('retorna ~1.1km entre dois pontos conhecidos em SP', () => {
    const dist = haversineDistance(-23.5631, -46.6544, -23.5505, -46.6576)
    expect(dist).toBeGreaterThan(1.0)
    expect(dist).toBeLessThan(1.5)
  })
})

describe('isOficinaOpen', () => {
  it('retorna true quando horario inclui hora atual', () => {
    // Data com timezone explícito (America/Sao_Paulo = UTC-3)
    // 2026-03-14T10:00:00-03:00 = sábado
    const result = isOficinaOpen(
      [{ dia_semana: 'sabado', horario_abertura: '08:00', horario_fechamento: '18:00' }],
      new Date('2026-03-14T10:00:00-03:00')
    )
    expect(result).toBe(true)
  })

  it('retorna false quando oficina não tem horário cadastrado', () => {
    const result = isOficinaOpen([], new Date('2026-03-14T10:00:00-03:00'))
    expect(result).toBe(false)
  })

  it('retorna false fora do horário de funcionamento', () => {
    const result = isOficinaOpen(
      [{ dia_semana: 'sabado', horario_abertura: '08:00', horario_fechamento: '12:00' }],
      new Date('2026-03-14T14:00:00-03:00')
    )
    expect(result).toBe(false)
  })
})

describe('calculateRankingScore', () => {
  const baseParams = {
    avaliacao_media: 5.0,
    total_avaliacoes: 100,
    isOpen: true,
    distanceKm: 0,
    destaque: false,
    destaque_ate: null,
  }

  it('retorna score alto para oficina perfeita, perto e aberta', () => {
    expect(calculateRankingScore(baseParams)).toBeGreaterThan(0.9)
  })

  it('destaque ativo eleva score ao máximo (acima de 1)', () => {
    const destaqueAtivo = { ...baseParams, destaque: true, destaque_ate: '2099-01-01T00:00:00Z' }
    expect(calculateRankingScore(destaqueAtivo)).toBeGreaterThan(calculateRankingScore(baseParams))
  })

  it('destaque expirado não eleva score', () => {
    const destaqueExpirado = { ...baseParams, destaque: true, destaque_ate: '2020-01-01T00:00:00Z' }
    expect(calculateRankingScore(destaqueExpirado)).toBeCloseTo(calculateRankingScore(baseParams), 2)
  })

  it('oficina fechada tem score menor que aberta com mesmos dados', () => {
    const aberta = calculateRankingScore(baseParams)
    const fechada = calculateRankingScore({ ...baseParams, isOpen: false })
    expect(aberta).toBeGreaterThan(fechada)
  })

  it('oficina mais próxima tem score maior', () => {
    const proxima = calculateRankingScore({ ...baseParams, distanceKm: 0.5 })
    const distante = calculateRankingScore({ ...baseParams, distanceKm: 10 })
    expect(proxima).toBeGreaterThan(distante)
  })
})
