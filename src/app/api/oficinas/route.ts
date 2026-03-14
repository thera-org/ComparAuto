// src/app/api/oficinas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { haversineDistance, isOficinaOpen, calculateRankingScore } from '@/lib/ranking'

const MAX_OFICINAS = 200 // Limite de segurança na query

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const servico = searchParams.get('servico')
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null

  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('oficinas')
      .select(`
        id, nome, endereco_completo, latitude, longitude,
        avaliacao_media, total_avaliacoes, status,
        destaque, destaque_ate,
        oficina_servicos (servico, valor),
        oficina_horarios (dia_semana, horario_abertura, horario_fechamento),
        oficina_imagens (url_imagem, ordem)
      `)
      .eq('status', 'ativo')
      .limit(MAX_OFICINAS)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let oficinas = data ?? []

    // Filtrar por serviço no JavaScript (TODO: migrar para PostgREST !inner filter)
    if (servico) {
      const servicoNorm = servico.toLowerCase().trim()
      oficinas = oficinas.filter((o: any) =>
        o.oficina_servicos?.some((s: { servico: string }) =>
          s.servico.toLowerCase().includes(servicoNorm)
        )
      )
    }

    const now = new Date()

    const enriched = oficinas.map((o: any) => {
      const distanceKm = (lat !== null && lng !== null && o.latitude && o.longitude)
        ? haversineDistance(lat, lng, o.latitude, o.longitude)
        : 999

      const isOpen = isOficinaOpen(o.oficina_horarios ?? [], now)

      const score = calculateRankingScore({
        avaliacao_media: o.avaliacao_media,
        total_avaliacoes: o.total_avaliacoes,
        isOpen,
        distanceKm,
        destaque: o.destaque ?? false,
        destaque_ate: o.destaque_ate,
      })

      const imagens = [...(o.oficina_imagens ?? [])].sort(
        (a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem
      )
      const imagemPrincipal = imagens[0]?.url_imagem ?? null

      const servicosFiltrados = servico
        ? (o.oficina_servicos ?? []).filter((s: { servico: string }) =>
            s.servico.toLowerCase().includes(servico.toLowerCase())
          )
        : (o.oficina_servicos ?? [])

      const precoMinimo = servicosFiltrados.length > 0
        ? Math.min(...servicosFiltrados.map((s: { valor: number }) => s.valor))
        : null

      return {
        id: o.id,
        nome: o.nome,
        endereco_completo: o.endereco_completo,
        latitude: o.latitude,
        longitude: o.longitude,
        avaliacao_media: o.avaliacao_media,
        total_avaliacoes: o.total_avaliacoes,
        destaque: o.destaque ?? false,
        isOpen,
        distanceKm: parseFloat(distanceKm.toFixed(1)),
        score,
        imagemPrincipal,
        precoMinimo,
        servicos: (o.oficina_servicos ?? []).map((s: { servico: string }) => s.servico),
      }
    })

    enriched.sort((a: any, b: any) => b.score - a.score)

    return NextResponse.json({ oficinas: enriched })
  } catch (err) {
    console.error('[GET /api/oficinas]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
