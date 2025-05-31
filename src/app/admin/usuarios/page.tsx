"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import AdminLayout from "@/components/admin-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Shield, Wrench, UserIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

interface User {
  id: string
  nome: string
  email: string
  tipo: string
  criado_em?: string
}

// Tipagem para o formulário de criação de usuário
interface CreateUserForm {
  nome?: string;
  sobrenome?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cpf?: string;
  cnpj?: string;
  username?: string;
  senha?: string;
}

// Tipagem para o payload de criação
type CreateUserPayload = {
  id: string;
  tipo: string;
  email?: string;
  nome?: string;
  telefone?: string;
  endereco?: string;
  cpf?: string;
  cnpj?: string;
  username?: string;
  senha?: string;
};

export default function UsersPage() {
  const router = useRouter()
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin") !== "true") {
      router.push("/admin/login")
    }
  }, [router])

  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [newTipo, setNewTipo] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createTipo, setCreateTipo] = useState("cliente");
  const { register, handleSubmit, reset } = useForm<CreateUserForm>();

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Buscar usuários diretamente da tabela usuarios
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')
        .order('criado_em', { ascending: false });

      if (usuariosError) {
        console.error("Erro ao buscar usuários:", usuariosError)
        throw usuariosError
      }

      // Corrige o mapeamento dos tipos ao carregar usuários do banco
      const formattedUsers: User[] = usuarios?.map((user) => {
        return {
          id: user.id,
          nome: user.nome || "Sem nome",
          email: user.email || "Email não disponível",
          tipo: user.tipo || "cliente",
          criado_em: user.criado_em,
        }
      }) || []

      setUsers(formattedUsers)
      setFilteredUsers(formattedUsers)
      setLoading(false)
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = (term: string) => {
    const lowercaseTerm = term.toLowerCase()
    const filtered = users.filter(
      (user) => user.nome.toLowerCase().includes(lowercaseTerm) || user.email.toLowerCase().includes(lowercaseTerm),
    )
    setFilteredUsers(filtered)
  }

  const tiposPermitidos = ["admin", "oficina", "cliente"];

  const confirmTipoChange = (user: User, tipo: string) => {
    // Garante que só valores válidos sejam aceitos
    if (!tiposPermitidos.includes(tipo)) {
      alert("Tipo de usuário inválido!")
      return
    }
    setSelectedUser(user)
    setNewTipo(tipo)
    setShowConfirmDialog(true)
  }

  const updateTipo = async () => {
    if (!selectedUser || !newTipo) return
    if (!tiposPermitidos.includes(newTipo)) {
      alert("Tipo de usuário inválido!")
      return
    }
    try {
      // Atualiza o campo 'tipo' no banco de dados
      const { error } = await supabase
        .from("usuarios")
        .update({ tipo: newTipo })
        .eq("id", selectedUser.id)

      if (error) throw error

      // Refaz o fetch dos usuários para garantir atualização real do banco
      await fetchUsers()
      setShowConfirmDialog(false)
      setSelectedUser(null)
      setNewTipo("")
    } catch (error) {
      alert("Erro ao atualizar função do usuário. Valor enviado: " + newTipo)
      console.error("Erro ao atualizar função:", error)
    }
  }

  const handleOpenCreate = () => {
    setShowCreateDialog(true);
    setCreateTipo("cliente");
    reset();
  };

  const handleTipoChange = (value: string) => {
    setCreateTipo(value);
    reset();
  };

  const onSubmitCreate = async (data: CreateUserForm) => {
    let payload: CreateUserPayload = { tipo: createTipo, id: uuidv4() };
    if (createTipo === "cliente") {
      payload = {
        ...payload,
        email: data.email,
        nome: `${data.nome} ${data.sobrenome}`.trim(),
        telefone: data.telefone,
        endereco: data.endereco,
        cpf: data.cpf,
      };
    } else if (createTipo === "oficina") {
      payload = {
        ...payload,
        email: data.email,
        nome: data.nome,
        telefone: data.telefone,
        endereco: data.endereco,
        cnpj: data.cnpj,
      };
    } else if (createTipo === "admin") {
      payload = {
        ...payload,
        username: data.username,
        senha: data.senha,
        nome: data.username || "Administrador", // Garante que o campo nome nunca será null
      };
    }
    const { error } = await supabase.from("usuarios").insert([payload]);
    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      setShowCreateDialog(false);
      fetchUsers();
    }
  };

  // Corrige o badge e o ícone para refletir os valores reais do banco
  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "admin":
        return (
          <Badge variant="default" className="bg-red-500">
            Admin
          </Badge>
        )
      case "oficina":
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
      case "admin":
        return <Shield className="h-4 w-4 mr-2" />
      case "oficina":
        return <Wrench className="h-4 w-4 mr-2" />
      default:
        return <UserIcon className="h-4 w-4 mr-2" />
    }
  }

  return (
    <AdminLayout searchPlaceholder="Buscar por nome ou email..." onSearch={handleSearch}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
          </div>
          <Button onClick={handleOpenCreate} className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg px-5 py-2.5 text-base shadow transition-colors">
            <span className="text-xl font-bold">+</span>
            Novo Usuário
          </Button>
        </div>
        <div className="rounded-md border bg-white overflow-hidden">
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
                filteredUsers.map((user) => (
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
                            onClick={() => confirmTipoChange(user, "admin")}
                            disabled={user.tipo === "admin"}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            <span>Tornar Admin</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmTipoChange(user, "oficina")}
                            disabled={user.tipo === "oficina"}
                          >
                            <Wrench className="h-4 w-4 mr-2" />
                            <span>Tornar Oficina</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmTipoChange(user, "cliente")}
                            disabled={user.tipo === "cliente"}
                          >
                            <UserIcon className="h-4 w-4 mr-2" />
                            <span>Tornar Cliente</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Preencha os dados conforme o tipo de usuário.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={createTipo} onValueChange={handleTipoChange}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="oficina">Oficina</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {createTipo === "cliente" && (
              <>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" {...register("nome", { required: true })} />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="sobrenome">Sobrenome</Label>
                    <Input id="sobrenome" {...register("sobrenome", { required: true })} />
                  </div>
                </div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email", { required: true })} />
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" {...register("telefone", { required: true })} />
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" {...register("endereco", { required: true })} />
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" {...register("cpf", { required: true })} />
              </>
            )}
            {createTipo === "oficina" && (
              <>
                <Label htmlFor="nome">Nome da oficina</Label>
                <Input id="nome" {...register("nome", { required: true })} />
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email", { required: true })} />
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" {...register("telefone", { required: true })} />
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" {...register("endereco", { required: true })} />
                <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                <Input id="cnpj" {...register("cnpj")} />
              </>
            )}
            {createTipo === "admin" && (
              <>
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username", { required: true })} />
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" {...register("senha", { required: true })} />
              </>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 text-white">Cadastrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar função do usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a alterar a função de <strong>{selectedUser?.nome}</strong> para{" "}
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
  )
}
