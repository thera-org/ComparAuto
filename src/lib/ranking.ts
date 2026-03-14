// src/lib/ranking.ts

export interface HorarioOficina {
  dia_semana: string
  horario_abertura: string
  horario_fechamento: string
}

export interface RankingParams {
  avaliacao_media: number | null
  total_avaliacoes: number | null
  isOpen: boolean
  distanceKm: number
  destaque: boolean
  destaque_ate: string | null
}

// Nomes em português para match com dados do banco
const DIAS_SEMANA = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']

/**
 * Distância em km entre dois pontos usando fórmula de Haversine.
 */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Verifica se a oficina está aberta em `now` (default: agora).
 * Usa horário local de `now` para calcular dia da semana e hora.
 */
export function isOficinaOpen(
  horarios: HorarioOficina[],
  now: Date = new Date()
): boolean {
  const diaNome = DIAS_SEMANA[now.getDay()]
  const horario = horarios.find(h => h.dia_semana === diaNome)
  if (!horario) return false

  const [abH, abM] = horario.horario_abertura.split(':').map(Number)
  const [feH, feM] = horario.horario_fechamento.split(':').map(Number)
  const agoraMin = now.getHours() * 60 + now.getMinutes()
  const aberturaMin = abH * 60 + abM
  const fechamentoMin = feH * 60 + feM

  return agoraMin >= aberturaMin && agoraMin < fechamentoMin
}

/**
 * Score composto (0–1+) para ordenação de resultados.
 *
 * Pesos base: disponibilidade 30% | avaliação 40% | proximidade 30%
 *
 * Destaque ativo (destaque=true e destaque_ate no futuro) retorna score=10,
 * garantindo que apareça antes de todos os resultados orgânicos.
 */
export function calculateRankingScore(params: RankingParams): number {
  const { avaliacao_media, total_avaliacoes, isOpen, distanceKm, destaque, destaque_ate } = params

  // Destaque ativo: score artificial, sempre no topo
  const destaqueAtivo = destaque &&
    (!destaque_ate || new Date(destaque_ate) > new Date())
  if (destaqueAtivo) return 10

  // Disponibilidade (0 ou 1)
  const disponibilidadeScore = isOpen ? 1 : 0

  // Avaliação (0–1): ponderado por quantidade de avaliações
  const rating = avaliacao_media ?? 0
  const totalAv = total_avaliacoes ?? 0
  const avaliacaoScore = totalAv > 0
    ? (rating / 5) * Math.min(totalAv / 50, 1)
    : 0

  // Proximidade (0–1): decaimento exponencial (0km=1, 10km≈0.37, 50km≈0.007)
  const proximidadeScore = Math.exp(-distanceKm / 10)

  return (
    disponibilidadeScore * 0.30 +
    avaliacaoScore * 0.40 +
    proximidadeScore * 0.30
  )
}
