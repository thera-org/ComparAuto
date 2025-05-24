"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AdminLayout from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, Wrench, FileText, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsData {
  users: number
  mechanics: number
  services: number
  growth: number
}

interface ServiceData {
  name: string
  serviços: number
}

interface UserRoleData {
  name: string
  value: number
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  loading: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData>({
    users: 0,
    mechanics: 0,
    services: 0,
    growth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [serviceData, setServiceData] = useState<ServiceData[]>([])
  const [userRoleData, setUserRoleData] = useState<UserRoleData[]>([])

  const fetchStats = async () => {
    try {
      // Buscar usuários da tabela correta
      const { data: usuarios, error: usuariosError } = await supabase.from("usuarios").select("*")
      if (usuariosError) throw usuariosError

      // Buscar serviços (se existir a tabela "servicos", senão deixa zerado)
      let totalServices = 0
      try {
        const { data: servicos, error: servicosError } = await supabase.from("servicos").select("*")
        if (servicosError) {
          // Se a tabela não existir, ignora o erro e mantém 0
          if (!servicosError.message.includes('does not exist')) throw servicosError
        } else {
          totalServices = servicos?.length || 0
        }
      } catch {
        totalServices = 0
      }

      // Calcular estatísticas
      const totalUsers = usuarios?.length || 0
      const totalMechanics = usuarios?.filter((u) => u.tipo === "oficina").length || 0

      // Calcular crescimento mensal (comparando com o mês anterior)
      const now = new Date()
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Buscar usuários criados no mês anterior
      const { data: previousMonthUsers, error: previousMonthError } = await supabase
        .from("usuarios")
        .select("id,criado_em")
        .gte("criado_em", firstDayLastMonth.toISOString())
        .lte("criado_em", lastDayLastMonth.toISOString())

      if (previousMonthError) throw previousMonthError

      // Buscar usuários criados no mês atual
      const { data: thisMonthUsers, error: thisMonthError } = await supabase
        .from("usuarios")
        .select("id,criado_em")
        .gte("criado_em", firstDayThisMonth.toISOString())
        .lte("criado_em", now.toISOString())

      if (thisMonthError) throw thisMonthError

      const previousMonthCount = previousMonthUsers?.length || 0
      const thisMonthCount = thisMonthUsers?.length || 0
      const growth = previousMonthCount > 0
        ? ((thisMonthCount - previousMonthCount) / previousMonthCount) * 100
        : 0

      setStats({
        users: totalUsers,
        mechanics: totalMechanics,
        services: totalServices,
        growth: Math.round(growth),
      })

      // Simular dados de serviços por mês (até ter dados reais)
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"]
      const servicesByMonth = months.map((month) => ({
        name: month,
        serviços: Math.floor(Math.random() * 50) + 10,
      }))
      setServiceData(servicesByMonth)

      // Gráfico de pizza de usuários por função
      const userRoles = [
        { name: "Clientes", value: usuarios?.filter((u) => u.tipo === "cliente").length || 0 },
        { name: "Oficinas", value: totalMechanics },
        { name: "Admins", value: usuarios?.filter((u) => u.tipo === "admin").length || 0 },
      ]
      setUserRoleData(userRoles)

      setLoading(false)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Configurar atualização periódica das estatísticas
    const interval = setInterval(fetchStats, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [])

  // Cores para o gráfico de pizza
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  const StatCard = ({ title, value, icon: Icon, loading }: StatCardProps) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? <Skeleton className="h-9 w-20 mt-1" /> : <h3 className="text-3xl font-bold mt-1">{value}</h3>}
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral e estatísticas do sistema</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total de Usuários" value={stats.users} icon={Users} loading={loading} />
          <StatCard title="Oficinas Cadastradas" value={stats.mechanics} icon={Wrench} loading={loading} />
          <StatCard title="Serviços Realizados" value={stats.services} icon={FileText} loading={loading} />
          <StatCard title="Crescimento Mensal" value={`${stats.growth}%`} icon={TrendingUp} loading={loading} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Serviços por Mês</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="serviços" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Distribuição de Usuários</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
