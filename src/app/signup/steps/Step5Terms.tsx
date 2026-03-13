'use client'

import Link from 'next/link'

import type { StepProps } from '../_types'

export function Step5Terms({ formData, onChange, onPrev, isLoading }: StepProps) {
  const isValid = formData.aceitaTermos === true

  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Quase lá!</h1>
        <p className="text-gray-500">Revise e aceite os termos para finalizar</p>
      </div>

      <div className="space-y-4 rounded-xl bg-[#F7F7F7] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <span className="material-icons text-primary">check</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{formData.nome}</p>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <span className="material-icons text-primary">phone</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{formData.telefone}</p>
            {formData.cidade && formData.estado && (
              <p className="text-sm text-gray-500">
                {formData.cidade}, {formData.estado}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={formData.aceitaTermos}
            onChange={e => onChange({ aceitaTermos: e.target.checked })}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">
            Li e aceito os{' '}
            <Link href="/termos" className="text-primary hover:underline">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>{' '}
            *
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={formData.aceitaMarketing}
            onChange={e => onChange({ aceitaMarketing: e.target.checked })}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">
            Quero receber novidades e ofertas por e-mail
          </span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <span className="material-icons text-sm">arrow_back</span> Voltar
        </button>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Criando...
            </>
          ) : (
            <>
              <span className="material-icons">check_circle</span> Criar conta
            </>
          )}
        </button>
      </div>
    </div>
  )
}
