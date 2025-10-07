'use client'

import { MoreHorizontal, Shield, Wrench, UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import AdminLayout from '@/components/admin-layout'
import AdminAuthGate from '@/components/AdminAuthGate'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  nome: string
  email: string
  tipo: string
  criado_em?: string
}

// Tipagem para o formulário de criação de usuário
interface CreateUserForm {
  nome?: string
  sobrenome?: string
  email?: string
  telefone?: string
  endereco?: string
  cpf?: string
  cnpj?: string
  username?: string
  senha?: string
}

// Tipagem para o payload de criação
type CreateUserPayload = {
  id: string
  tipo: string
  email?: string
  nome?: string
  telefone?: string
  endereco?: string
  cpf?: string
  cnpj?: string
  username?: string
  senha?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [newTipo, setNewTipo] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createTipo, setCreateTipo] = useState('cliente')
  const { register, handleSubmit, reset } = useForm<CreateUserForm>()

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Buscar usuários diretamente da tabela usuarios
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')
        .order('criado_em', { ascending: false })

      if (usuariosError) {
        console.error('Erro ao buscar usuários:', usuariosError)
        throw usuariosError
      }

      // Corrige o mapeamento dos tipos ao carregar usuários do banco
      const formattedUsers: User[] =
        usuarios?.map(user => {
          return {
            id: user.id,
            nome: user.nome || 'Sem nome',
            email: user.email || 'Email não disponível',
            tipo: user.tipo || 'cliente',
            criado_em: user.criado_em,
          }
        }) || []

      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = (term: string) => {
    const lowercaseTerm = term.toLowerCase()
    const filtered = users.filter(
      user =>
        user.nome.toLowerCase().includes(lowercaseTerm) ||
        user.email.toLowerCase().includes(lowercaseTerm)
    )
    setFilteredUsers(filtered)
  }

  const tiposPermitidos = ['admin', 'oficina', 'cliente']

  const confirmTipoChange = (user: User, tipo: string) => {
    // Garante que só valores válidos sejam aceitos
    if (!tiposPermitidos.includes(tipo)) {
      alert('Tipo de usuário inválido!')
      return
    }
    setSelectedUser(user)
    setNewTipo(tipo)
    setShowConfirmDialog(true)
  }

  const updateTipo = async () => {
    if (!selectedUser || !newTipo) return
    if (!tiposPermitidos.includes(newTipo)) {
      alert('Tipo de usuário inválido!')
      return
    }
    try {
      // Atualiza o campo 'tipo' no banco de dados
      const { error } = await supabase
        .from('usuarios')
        .update({ tipo: newTipo })
        .eq('id', selectedUser.id)

      if (error) throw error

      // Refaz o fetch dos usuários para garantir atualização real do banco
      await fetchUsers()
      setShowConfirmDialog(false)
      setSelectedUser(null)
      setNewTipo('')
    } catch (error) {
      alert('Erro ao atualizar função do usuário. Valor enviado: ' + newTipo)
      console.error('Erro ao atualizar função:', error)
    }
  }

  const handleOpenCreate = () => {
    setShowCreateDialog(true)
    setCreateTipo('cliente')
    reset()
  }

  const handleTipoChange = (value: string) => {
    setCreateTipo(value)
    reset()
  }

  const onSubmitCreate = async (data: CreateUserForm) => {
    let payload: CreateUserPayload = { tipo: createTipo, id: uuidv4() }
    if (createTipo === 'cliente') {
      payload = {
        ...payload,
        email: data.email,
        nome: `${data.nome} ${data.sobrenome}`.trim(),
        telefone: data.telefone,
        endereco: data.endereco,
        cpf: data.cpf,
      }
    } else if (createTipo === 'oficina') {
      payload = {
        ...payload,
        email: data.email,
        nome: data.nome,
        telefone: data.telefone,
        endereco: data.endereco,
        cnpj: data.cnpj,
      }
    } else if (createTipo === 'admin') {
      payload = {
        ...payload,
        username: data.username,
        senha: data.senha,
        nome: data.username || 'Administrador', // Garante que o campo nome nunca será null
      }
    }
    const { error } = await supabase.from('usuarios').insert([payload])
    if (error) {
      alert('Erro ao cadastrar: ' + error.message)
    } else {
      setShowCreateDialog(false)
      fetchUsers()
    }
  }

  // Corrige o badge e o ícone para refletir os valores reais do banco
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return (
          <Badge variant="default" className="bg-red-500">
            Admin
          </Badge>
        )
      case 'oficina':
        return (
          <Badge variant="default" className="bg-green-500">
            Oficina
          </Badge>
        )
      default:
        return <Badge variant="outline">Cliente</Badge>
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return <Shield className="mr-2 h-4 w-4" />
      case 'oficina':
        return <Wrench className="mr-2 h-4 w-4" />
      default:
        return <UserIcon className="mr-2 h-4 w-4" />
    }
  }

  return (
    <AdminAuthGate>
      <AdminLayout searchPlaceholder="Buscar por nome ou email..." onSearch={handleSearch}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
              <p className="mt-1 text-muted-foreground">Gerencie os usuários do sistema</p>
            </div>
            <Button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-base font-medium text-white shadow transition-colors hover:bg-neutral-800"
            >
              <span className="text-xl font-bold">+</span>
              Novo Usuário
            </Button>
          </div>
          <div className="overflow-hidden rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-5 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[200px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getTipoBadge(user.tipo)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => confirmTipoChange(user, 'admin')}
                              disabled={user.tipo === 'admin'}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Tornar Admin</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmTipoChange(user, 'oficina')}
                              disabled={user.tipo === 'oficina'}
                            >
                              <Wrench className="mr-2 h-4 w-4" />
                              <span>Tornar Oficina</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmTipoChange(user, 'cliente')}
                              disabled={user.tipo === 'cliente'}
                            >
                              <UserIcon className="mr-2 h-4 w-4" />
                              <span>Tornar Cliente</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Modal de criação de usuário */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-lg bg-white shadow-xl sm:max-w-[600px]">
            <DialogHeader className="space-y-3 border-b border-gray-200 pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Novo Usuário
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Preencha os dados conforme o tipo de usuário.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">
                  Tipo de Usuário
                </Label>
                <Select value={createTipo} onValueChange={handleTipoChange}>
                  <SelectTrigger id="tipo" className="h-10 w-full border border-gray-300">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createTipo === 'cliente' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                        Nome <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nome"
                        placeholder="Digite o nome"
                        {...register('nome', { required: true })}
                        className="h-10 w-full rounded-md border border-gray-300 px-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sobrenome" className="text-sm font-medium text-gray-700">
                        Sobrenome <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="sobrenome"
                        placeholder="Digite o sobrenome"
                        {...register('sobrenome', { required: true })}
                        className="h-10 w-full rounded-md border border-gray-300 px-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite o email"
                      {...register('email', { required: true })}
                      className="h-10 w-full rounded-md border border-gray-300 px-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                        Telefone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        {...register('telefone', { required: true })}
                        className="h-10 w-full rounded-md border border-gray-300 px-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                        CPF <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        {...register('cpf', { required: true })}
                        className="h-10 w-full rounded-md border border-gray-300 px-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                      Endereço <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="endereco"
                      placeholder="Digite o endereço completo"
                      {...register('endereco', { required: true })}
                      className="h-10 w-full rounded-md border border-gray-300 px-3"
                    />
                  </div>
                </div>
              )}

              {createTipo === 'oficina' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                      Nome da Oficina <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Digite o nome da oficina"
                      {...register('nome', { required: true })}
                      className="h-10 w-full rounded-md border border-gray-300 px-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite o email da oficina"
                      {...register('email', { required: true })}
                      className="h-10 w-full rounded-md border border-gray-300 px-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                        Telefone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        {...register('telefone', { required: true })}
                        className="h-10 w-full rounded-md border border-gray-300 px-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
                        CNPJ <span className="text-xs text-gray-500">(opcional)</span>
                      </Label>
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        {...register('cnpj')}
                        className="h-10 w-full rounded-md border border-gray-300 px-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                      Endereço <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="endereco"
                      placeholder="Digite o endereço da oficina"
                      {...register('endereco', { required: true })}
                      className="h-10 w-full rounded-md border border-gray-300 px-3"
                    />
                  </div>
                </div>
              )}

              {createTipo === 'admin' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="username"
                      placeholder="Digite o username"
                      {...register('username', { required: true })}
                      className="h-10 w-full rounded-md border border-gray-300 px-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                      Senha <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="senha"
                      type="password"
                      placeholder="Digite uma senha segura"
                      {...register('senha', { required: true })}
                      className="h-10 w-full rounded-md border border-gray-300 px-3"
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full border border-gray-300 px-6 hover:bg-gray-50 sm:w-auto"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="h-10 w-full rounded-md bg-blue-600 px-6 font-medium text-white hover:bg-blue-700 sm:w-auto"
                >
                  Cadastrar Usuário
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alterar função do usuário</AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a alterar a função de <strong>{selectedUser?.nome}</strong> para{' '}
                <strong>{newTipo}</strong>. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={updateTipo}>
                {getTipoIcon(newTipo)}
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminAuthGate>
  )
}
