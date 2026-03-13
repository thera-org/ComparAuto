'use client'

import type { AccountType, StepProps, UserType } from '../_types'

export function Step2AccountType({ formData, onChange, onNext, onPrev }: StepProps) {
  const isValid = formData.tipoContaEmpresa !== null && formData.tipoUsuario !== null

  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Tipo de conta</h1>
        <p className="text-gray-500">Selecione como você usará a plataforma</p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">Tipo de conta</label>
        <div className="grid grid-cols-2 gap-3">
          {(['pessoal', 'empresa'] as AccountType[]).map(type => (
            <button
              key={type!}
              type="button"
              onClick={() => onChange({ tipoContaEmpresa: type })}
              className={`rounded-xl border-2 p-4 text-left transition ${
                formData.tipoContaEmpresa === type
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="material-icons mb-2 block text-2xl">
                {type === 'pessoal' ? 'person' : 'business'}
              </span>
              <span className="block font-medium text-gray-900">
                {type === 'pessoal' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </span>
              <span className="text-sm text-gray-500">
                {type === 'pessoal' ? 'Para uso pessoal' : 'Para empresas'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">Como você usará?</label>
        <div className="grid grid-cols-2 gap-3">
          {(['cliente', 'oficina'] as UserType[]).map(type => (
            <button
              key={type!}
              type="button"
              onClick={() => onChange({ tipoUsuario: type })}
              className={`rounded-xl border-2 p-4 text-left transition ${
                formData.tipoUsuario === type
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="material-icons mb-2 block text-2xl">
                {type === 'cliente' ? 'directions_car' : 'build'}
              </span>
              <span className="block font-medium text-gray-900">
                {type === 'cliente' ? 'Sou Cliente' : 'Tenho Oficina'}
              </span>
              <span className="text-sm text-gray-500">
                {type === 'cliente' ? 'Buscar serviços' : 'Oferecer serviços'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <span className="material-icons text-sm">arrow_back</span> Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
