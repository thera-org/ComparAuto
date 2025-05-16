"use client"

import { useEffect, useState } from "react"
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

interface User {
  id: string
  nome: string
  email: string
  role: string
  created_at?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [newRole, setNewRole] = useState("")

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error

      const formattedUsers: User[] = data.map((user) => ({
        id: user.id,
        nome: user.nome || "Sem nome",
        email: user.email,
        role: user.role || "user",
        created_at: user.created_at,
      }))

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

  const confirmRoleChange = (user: User, role: string) => {
    setSelectedUser(user)
    setNewRole(role)
    setShowConfirmDialog(true)
  }

  const updateRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", selectedUser.id)

      if (error) throw error

      // Atualiza a lista local
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, role: newRole } : user)))
      setFilteredUsers(filteredUsers.map((user) => (user.id === selectedUser.id ? { ...user, role: newRole } : user)))

      setShowConfirmDialog(false)
    } catch (error) {
      console.error("Erro ao atualizar função:", error)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="default" className="bg-red-500">
            Admin
          </Badge>
        )
      case "mechanic":
        return (
          <Badge variant="default" className="bg-green-500">
            Oficina
          </Badge>
        )
      default:
        return <Badge variant="outline">Cliente</Badge>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 mr-2" />
      case "mechanic":
        return <Wrench className="h-4 w-4 mr-2" />
      default:
        return <UserIcon className="h-4 w-4 mr-2" />
    }
  }

  return (
    <AdminLayout searchPlaceholder="Buscar por nome ou email..." onSearch={handleSearch}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
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
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
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
                            onClick={() => confirmRoleChange(user, "admin")}
                            disabled={user.role === "admin"}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            <span>Tornar Admin</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmRoleChange(user, "mechanic")}
                            disabled={user.role === "mechanic"}
                          >
                            <Wrench className="h-4 w-4 mr-2" />
                            <span>Tornar Oficina</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmRoleChange(user, "user")}
                            disabled={user.role === "user"}
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar função do usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a alterar a função de <strong>{selectedUser?.nome}</strong> para{" "}
              <strong>{newRole}</strong>. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={updateRole}>
              {getRoleIcon(newRole)}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
