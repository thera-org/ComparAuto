"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AdminLayout from "@/components/admin-layout"
import AdminAuthGate from "@/components/AdminAuthGate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { 
  Users, 
  Wrench, 
  FileText, 
  TrendingUp,
  Activity,
  Bell,
  Plus,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface StatsData {
  users: number
  mechanics: number
  services: number
  growth: number
  pendingApprovals: number
  activeServices: number
  monthlyRevenue: number
  avgRating: number
}

interface ServiceData {
  name: string
  serviços: number
  color?: string
}

interface UserRoleData {
  name: string
  value: number
  color: string
}

interface RecentActivity {
  id: string
  type: "user_signup" | "workshop_registered" | "service_completed" | "review_added"
  description: string
  timestamp: string
  status: "success" | "warning" | "info"
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  loading: boolean
  trend?: number
  description?: string
  color?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData>({
    users: 0,
    mechanics: 0,
    services: 0,
    growth: 0,
    pendingApprovals: 0,
    activeServices: 0,
    monthlyRevenue: 0,
    avgRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [serviceData, setServiceData] = useState<ServiceData[]>([])
  const [userRoleData, setUserRoleData] = useState<UserRoleData[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const fetchStats = async () => {
    try {
      // Buscar usuários da tabela correta
      const { data: usuarios, error: usuariosError } = await supabase.from("usuarios").select("*")
      if (usuariosError) throw usuariosError

      // Buscar oficinas
      const { data: oficinas, error: oficinasError } = await supabase.from("oficinas").select("*")
      if (oficinasError && !oficinasError.message.includes('does not exist')) throw oficinasError

      // Buscar serviços (se existir a tabela "servicos", senão deixa zerado)
      let totalServices = 0
      try {
        const { data: servicos, error: servicosError } = await supabase.from("servicos").select("*")
        if (servicosError) {
          if (!servicosError.message.includes('does not exist')) throw servicosError
        } else {
          totalServices = servicos?.length || 0
        }
      } catch {
        totalServices = 0
      }

      // Calcular estatísticas básicas
      const totalUsers = usuarios?.length || 0
      const totalMechanics = usuarios?.filter((u) => u.tipo === "oficina").length || 0
      const totalOficinas = oficinas?.length || 0
      const pendingApprovals = oficinas?.filter((o) => o.status === "pendente").length || 0

      // Calcular crescimento mensal
      const now = new Date()
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      const { data: previousMonthUsers } = await supabase
        .from("usuarios")
        .select("id,criado_em")
        .gte("criado_em", firstDayLastMonth.toISOString())
        .lte("criado_em", lastDayLastMonth.toISOString())

      const { data: thisMonthUsers } = await supabase
        .from("usuarios")
        .select("id,criado_em")
        .gte("criado_em", firstDayThisMonth.toISOString())
        .lte("criado_em", now.toISOString())

      const previousMonthCount = previousMonthUsers?.length || 0
      const thisMonthCount = thisMonthUsers?.length || 0
      const growth = previousMonthCount > 0
        ? ((thisMonthCount - previousMonthCount) / previousMonthCount) * 100
        : thisMonthCount > 0 ? 100 : 0

      setStats({
        users: totalUsers,
        mechanics: Math.max(totalMechanics, totalOficinas),
        services: totalServices,
        growth: Math.round(growth),
        pendingApprovals,
        activeServices: Math.floor(totalServices * 0.7), // 70% dos serviços ativos
        monthlyRevenue: 15750, // Valor simulado
        avgRating: 4.6, // Rating simulado
      })

      // Dados de serviços por mês (simulados até ter dados reais)
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"]
      const servicesByMonth = months.map((month, index) => ({
        name: month,
        serviços: Math.floor(Math.random() * 30) + 20 + (index * 2),
        color: `hsl(${200 + index * 30}, 70%, 50%)`,
      }))
      setServiceData(servicesByMonth)

      // Gráfico de pizza de usuários por função
      const userRoles = [
        { 
          name: "Clientes", 
          value: usuarios?.filter((u) => u.tipo === "cliente").length || 0, 
          color: "#3B82F6" 
        },
        { 
          name: "Oficinas", 
          value: Math.max(totalMechanics, totalOficinas), 
          color: "#10B981" 
        },
        { 
          name: "Admins", 
          value: usuarios?.filter((u) => u.tipo === "admin").length || 0, 
          color: "#F59E0B" 
        },
      ]
      setUserRoleData(userRoles)

      // Atividades recentes simuladas
      const activities: RecentActivity[] = [
        {
          id: "1",
          type: "user_signup",
          description: "Novo cliente cadastrado: João Silva",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: "success"
        },
        {
          id: "2", 
          type: "workshop_registered",
          description: "Nova oficina registrada: AutoCenter Premium",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          status: "info"
        },
        {
          id: "3",
          type: "service_completed",
          description: "Serviço concluído: Troca de óleo - R$ 85,00",
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          status: "success"
        },
        {
          id: "4",
          type: "review_added",
          description: "Nova avaliação: 5 estrelas para Oficina do Zé",
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          status: "success"
        }
      ]
      setRecentActivities(activities)

      setLoading(false)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const EnhancedStatCard = ({ title, value, icon: Icon, loading, trend, description, color = "primary" }: StatCardProps) => (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-9 w-20 mt-1" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold mt-1">{value}</h3>
                {trend !== undefined && (
                  <span className={`text-sm font-medium flex items-center ${
                    trend >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? "rotate-180" : ""}`} />
                    {Math.abs(trend)}%
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${
            color === "success" ? "bg-green-100 text-green-600" :
            color === "warning" ? "bg-yellow-100 text-yellow-600" :
            color === "danger" ? "bg-red-100 text-red-600" :
            "bg-primary/10 text-primary"
          }`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "user_signup": return Users
      case "workshop_registered": return Wrench
      case "service_completed": return CheckCircle
      case "review_added": return Star
      default: return Activity
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  return (
    <AdminAuthGate>
      <AdminLayout>
      <div className="space-y-8">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral e estatísticas do sistema</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Link href="/admin/oficinas/nova">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Oficina
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedStatCard 
            title="Total de Usuários" 
            value={stats.users} 
            icon={Users} 
            loading={loading}
            trend={stats.growth}
            description="Crescimento mensal"
          />
          <EnhancedStatCard 
            title="Oficinas Cadastradas" 
            value={stats.mechanics} 
            icon={Wrench} 
            loading={loading}
            color="success"
            description={`${stats.pendingApprovals} pendentes`}
          />
          <EnhancedStatCard 
            title="Serviços Ativos" 
            value={stats.activeServices} 
            icon={Activity} 
            loading={loading}
            color="primary"
            description="Em andamento"
          />
          <EnhancedStatCard 
            title="Receita Mensal" 
            value={`R$ ${stats.monthlyRevenue.toLocaleString()}`} 
            icon={TrendingUp} 
            loading={loading}
            trend={12.5}
            color="success"
          />
        </div>

        {/* Secondary stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Pendentes</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.pendingApprovals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Avaliação Média</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.avgRating}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Tempo Médio</span>
              </div>
              <p className="text-2xl font-bold mt-1">2.5h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Taxa Sucesso</span>
              </div>
              <p className="text-2xl font-bold mt-1">94%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Serviços por Mês</CardTitle>
                  <p className="text-sm text-muted-foreground">Evolução dos serviços realizados</p>
                </div>
                <div className="flex gap-2">
                  {(["7d", "30d", "90d"] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="serviços" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Usuários</CardTitle>
                <p className="text-sm text-muted-foreground">Breakdown por tipo de usuário</p>
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
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

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/usuarios/cadastro">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                </Link>
                <Link href="/admin/oficinas/nova">
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="h-4 w-4 mr-2" />
                    Cadastrar Oficina
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : (
                  recentActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type)
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-full ${
                          activity.status === "success" ? "bg-green-100 text-green-600" :
                          activity.status === "warning" ? "bg-yellow-100 text-yellow-600" :
                          "bg-blue-100 text-blue-600"
                        }`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div className="pt-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Eye className="h-3 w-3 mr-2" />
                    Ver todas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
    </AdminAuthGate>
  )
}
