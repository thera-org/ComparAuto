'use client'

const SERVICOS_POPULARES = [
  { label: 'Troca de óleo', emoji: '🛢' },
  { label: 'Freio', emoji: '🔧' },
  { label: 'Elétrica', emoji: '⚡' },
  { label: 'Mecânica Geral', emoji: '🔩' },
  { label: 'Lanternagem', emoji: '🎨' },
  { label: 'Ar-condicionado', emoji: '❄️' },
  { label: 'Suspensão', emoji: '⚙️' },
  { label: 'Alinhamento', emoji: '🎯' },
]

interface ServiceChipsProps {
  selected: string | null
  onSelect: (servico: string) => void
}

export function ServiceChips({ selected, onSelect }: ServiceChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {SERVICOS_POPULARES.map(({ label, emoji }) => (
        <button
          key={label}
          onClick={() => onSelect(label)}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
            whitespace-nowrap border transition-all shrink-0
            ${selected === label
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600'}
          `}
        >
          <span className="text-base leading-none">{emoji}</span>
          {label}
        </button>
      ))}
    </div>
  )
}
