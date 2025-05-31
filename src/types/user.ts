// Tipos centralizados para usuário

/**
 * Representa o perfil do usuário
 */
export interface UserProfile {
  id: string
  nome: string
  email: string
  telefone?: string
  endereco?: string
  avatar_url?: string
}
