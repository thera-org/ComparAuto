"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AdminLayout from "@/components/admin-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus, MapPin, Phone, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

interface Oficina {
  id: string
  nome: string
  email: string
  telefone: string
  endereco: string
  descricao: string
  status: string
  user_id: string
}

const oficinaSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  endereco: z.string().min(5, { message: "Endereço deve ter pelo menos 5 caracteres" }),
  descricao: z.string().optional(),
  status: z.string(),
  user_id: z.string().uuid({ message: "ID de usuário inválido" }).optional().or(z.literal("")).optional(),
})

export default function OficinasPage() {
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [filteredOficinas, setFilteredOficinas] = useState<Oficina[]>([])
  const [loading, setLoading] = useState(true)
  interface User {
    id: string
    nome?: string
    email: string
    // add other fields as needed from your users table
  }
  
    const [users, setUsers] = useState<User[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentOficina, setCurrentOficina] = useState<Oficina | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter();

  const form = useForm<z.infer<typeof oficinaSchema>>({
    resolver: zodResolver(oficinaSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      descricao: "",
      status: "ativo",
      user_id: "",
    },
  })

  const fetchOficinas = async () => {
    try {
      // Buscar usuários que são mecânicos
      const { data: usersData, error: usersError } = await supabase.from("usuarios").select("*").eq("tipo", "mechanic")
      if (usersError) throw usersError
      setUsers(usersData || [])

      // Buscar oficinas
      const { data, error } = await supabase.from("oficinas").select("*").order("nome")
      if (error) throw error
      setOficinas(data || [])
      setFilteredOficinas(data || [])
      setLoading(false)
    } catch (error) {
      console.error("Erro ao buscar oficinas:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOficinas()
  }, [])

  const handleSearch = (term: string) => {
    const lowercaseTerm = term.toLowerCase()
    const filtered = oficinas.filter(
      (oficina) =>
        oficina.nome.toLowerCase().includes(lowercaseTerm) || oficina.endereco.toLowerCase().includes(lowercaseTerm),
    )
    setFilteredOficinas(filtered)
  }

  const handleEdit = (oficina: Oficina) => {
    setCurrentOficina(oficina)
    setIsEditing(true)

    form.reset({
      nome: oficina.nome,
      email: oficina.email,
      telefone: oficina.telefone,
      endereco: oficina.endereco,
      descricao: oficina.descricao || "",
      status: oficina.status,
      user_id: oficina.user_id,
    })

    setDialogOpen(true)
  }

  const handleAddNew = () => {
    router.push("/admin/oficinas/nova");
  }

  const onSubmit = async (data: z.infer<typeof oficinaSchema>) => {
    try {
      if (isEditing && currentOficina) {
        // Atualizar oficina existente
        const { error } = await supabase.from("oficinas").update(data).eq("id", currentOficina.id)

        if (error) throw error

        // Atualizar estado local
        setOficinas(oficinas.map((o) => (o.id === currentOficina.id ? { ...o, ...data } : o)))
        setFilteredOficinas(filteredOficinas.map((o) => (o.id === currentOficina.id ? { ...o, ...data } : o)))
      } else {
        // Criar nova oficina
        const { data: newOficina, error } = await supabase.from("oficinas").insert(data).select().single()

        if (error) throw error

        // Atualizar estado local
        setOficinas([newOficina, ...oficinas])
        setFilteredOficinas([newOficina, ...filteredOficinas])
      }

      setDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar oficina:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return (
          <Badge variant="default" className="bg-green-500">
            Ativo
          </Badge>
        )
      case "inativo":
        return (
          <Badge variant="default" className="bg-gray-500">
            Inativo
          </Badge>
        )
      case "pendente":
        return (
          <Badge variant="default" className="bg-yellow-500">
            Pendente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AdminLayout searchPlaceholder="Buscar por nome ou endereço..." onSearch={handleSearch}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Oficinas</h1>
            <p className="text-muted-foreground mt-1">Gerencie as oficinas cadastradas no sistema</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Oficina
          </Button>
        </div>

        <div className="rounded-md border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Status</TableHead>
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
                        <Skeleton className="h-5 w-[250px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : filteredOficinas.length > 0 ? (
                filteredOficinas.map((oficina) => (
                  <TableRow key={oficina.id}>
                    <TableCell className="font-medium">{oficina.nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {oficina.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {oficina.telefone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{oficina.endereco}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(oficina.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(oficina)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhuma oficina encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Oficina" : "Nova Oficina"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize as informações da oficina abaixo."
                : "Preencha os dados para cadastrar uma nova oficina."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da oficina" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email de contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefone de contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição dos serviços oferecidos" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário Associado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um usuário (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nome ? `${user.nome} (${user.email})` : user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Usuário que terá acesso a esta oficina (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">{isEditing ? "Salvar alterações" : "Cadastrar oficina"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
