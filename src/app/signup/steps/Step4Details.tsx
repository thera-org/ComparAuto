'use client'

import { formatCPF, formatCNPJ, formatCEP } from '@/lib/validations'

import type { StepProps } from '../_types'

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export function Step4Details({ formData, onChange, onNext, onPrev, isLoading }: StepProps) {
  const isOficina = formData.tipoUsuario === 'oficina'
  const isEmpresa = formData.tipoContaEmpresa === 'empresa'

  const isValid = isOficina
    ? !!(formData.nomeOficina && formData.endereco && formData.cidade && formData.estado)
    : !!(formData.cpf && formData.endereco && formData.cidade && formData.estado)

  return (
    <div className="space-y-5">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          {isOficina ? 'Dados da Oficina' : 'Endereço'}
        </h1>
        <p className="text-gray-500">
          {isOficina ? 'Informe os dados da sua oficina' : 'Onde você está localizado?'}
        </p>
      </div>

      {isOficina && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Nome da Oficina *
          </label>
          <input
            type="text"
            value={formData.nomeOficina || ''}
            onChange={e => onChange({ nomeOficina: e.target.value })}
            placeholder="Nome da oficina"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {!isOficina && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">CPF *</label>
          <input
            type="text"
            value={formData.cpf || ''}
            onChange={e => onChange({ cpf: formatCPF(e.target.value) })}
            placeholder="000.000.000-00"
            maxLength={14}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {isEmpresa && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Nome Empresa</label>
            <input
              type="text"
              value={formData.nomeEmpresa || ''}
              onChange={e => onChange({ nomeEmpresa: e.target.value })}
              placeholder="Nome da empresa"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">CNPJ</label>
            <input
              type="text"
              value={formData.cnpj || ''}
              onChange={e => onChange({ cnpj: formatCNPJ(e.target.value) })}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Endereço *</label>
        <input
          type="text"
          value={formData.endereco || ''}
          onChange={e => onChange({ endereco: e.target.value })}
          placeholder="Rua, número, bairro"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Cidade *</label>
          <input
            type="text"
            value={formData.cidade || ''}
            onChange={e => onChange({ cidade: e.target.value })}
            placeholder="Cidade"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Estado *</label>
          <select
            value={formData.estado || ''}
            onChange={e => onChange({ estado: e.target.value })}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
          >
            <option value="">UF</option>
            {ESTADOS_BR.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">CEP</label>
        <input
          type="text"
          value={formData.cep || ''}
          onChange={e => onChange({ cep: formatCEP(e.target.value) })}
          placeholder="00000-000"
          maxLength={9}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
        />
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
          type={isOficina ? 'submit' : 'button'}
          onClick={!isOficina ? onNext : undefined}
          disabled={!isValid || (isOficina && isLoading)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
        >
          {isOficina && isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Criando...
            </>
          ) : isOficina ? (
            'Criar conta'
          ) : (
            'Continuar'
          )}
        </button>
      </div>
    </div>
  )
}
