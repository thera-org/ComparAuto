'use client'

import { useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { GeolocationStatus } from '@/lib/hooks/useGeolocation'

const SUGGESTIONS = [
  'Troca de óleo', 'Revisão geral', 'Freio', 'Suspensão',
  'Elétrica', 'Ar-condicionado', 'Lanternagem', 'Alinhamento',
]

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (value: string) => void
  geoStatus: GeolocationStatus
  onRequestLocation: () => void
}

export function SearchBar({ value, onChange, onSearch, geoStatus, onRequestLocation }: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filtered = value.length > 1
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : SUGGESTIONS

  function handleSelect(suggestion: string) {
    onChange(suggestion)
    setShowSuggestions(false)
    onSearch(suggestion)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      onSearch(value)
      setShowSuggestions(false)
    }
  }

  const geoLabel = {
    idle: 'Usar minha localização',
    loading: 'Detectando...',
    success: 'Localização detectada',
    denied: 'Permissão negada',
    error: 'Erro de localização',
  }[geoStatus]

  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex items-center px-4 py-3 flex-1 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={value}
            onChange={e => { onChange(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Que serviço seu carro precisa?"
            className="flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
          />
        </div>
        <button
          onClick={onRequestLocation}
          disabled={geoStatus === 'loading'}
          aria-label="Detectar localização"
          className={`
            flex items-center gap-2 px-4 py-3 text-sm font-medium border-l border-slate-200 shrink-0 transition-colors
            ${geoStatus === 'success' ? 'text-green-600 bg-green-50'
              : geoStatus === 'denied' || geoStatus === 'error' ? 'text-red-500 bg-red-50'
              : 'text-rose-600 bg-rose-50 hover:bg-rose-100'}
          `}
        >
          {geoStatus === 'loading'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <MapPin className="w-4 h-4" />}
          <span className="hidden sm:inline">{geoLabel}</span>
        </button>
      </div>

      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {filtered.map(s => (
            <button
              key={s}
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <Search className="w-4 h-4 text-slate-400" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
