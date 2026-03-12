// Tipos centralizados para usuário

export interface UserProfile {
  id: string
  nome: string
  email: string
  telefone?: string
  endereco?: string
  avatar_url?: string
  tipo?: 'cliente' | 'oficina' | 'admin'
  cidade?: string
  estado?: string
  cep?: string
  cpf?: string
  cnpj?: string
  razao_social?: string
  nome_oficina?: string
  nome_empresa?: string
  criado_em?: string
}
