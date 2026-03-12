export type AccountType = 'pessoal' | 'empresa' | null
export type UserType = 'cliente' | 'oficina' | null

export interface SignupFormData {
  telefone: string
  tipoContaEmpresa: AccountType
  tipoUsuario: UserType
  nome: string
  email: string
  password: string
  confirmPassword: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  aceitaTermos?: boolean
  aceitaMarketing?: boolean
  nomeEmpresa?: string
  cnpj?: string
  razaoSocial?: string
  nomeOficina?: string
}

export interface StepProps {
  formData: SignupFormData
  onChange: (partial: Partial<SignupFormData>) => void
  onNext: () => void
  onPrev: () => void
  isLoading?: boolean
}
