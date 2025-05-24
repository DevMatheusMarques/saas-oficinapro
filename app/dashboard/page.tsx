"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Car, FileText, DollarSign, Package, AlertTriangle, TrendingUp, Clock, RefreshCw } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"

export default function DashboardPage() {
  const { stats, loading, error, refetch } = useDashboardStats()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu negócio</p>
            {error && <p className="text-sm text-orange-600 mt-1">⚠️ Alguns dados podem estar desatualizados</p>}
          </div>
          <Button variant="outline" onClick={refetch} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motos Cadastradas</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMotorcycles || 0}</div>
              <p className="text-xs text-muted-foreground">Veículos no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">Mês atual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços Concluídos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedServicesThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingBudgets || 0}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordens de Serviço Ativas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeServiceOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Em andamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peças em Baixo Estoque</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.lowStockParts || 0}</div>
              <p className="text-xs text-muted-foreground">Requer atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos em Atraso</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.overduePayments || 0}</div>
              <p className="text-xs text-muted-foreground">Ação necessária</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>Informações sobre o funcionamento do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="flex items-center space-x-4 rounded-md border border-orange-200 bg-orange-50 p-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Alguns dados não puderam ser carregados</p>
                    <p className="text-sm text-muted-foreground">Verifique a conexão com o banco de dados</p>
                  </div>
                  <Badge variant="outline" className="text-orange-600">
                    Atenção
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center space-x-4 rounded-md border border-green-200 bg-green-50 p-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Sistema funcionando normalmente</p>
                    <p className="text-sm text-muted-foreground">Todos os dados foram carregados com sucesso</p>
                  </div>
                  <Badge className="bg-green-600">Online</Badge>
                </div>
              )}

              {(stats?.lowStockParts || 0) > 0 && (
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <Package className="h-6 w-6 text-orange-600" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Peças com estoque baixo</p>
                    <p className="text-sm text-muted-foreground">{stats?.lowStockParts} peças precisam de reposição</p>
                  </div>
                  <Badge variant="outline" className="text-orange-600">
                    Atenção
                  </Badge>
                </div>
              )}

              {(stats?.overduePayments || 0) > 0 && (
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Pagamentos em atraso</p>
                    <p className="text-sm text-muted-foreground">{stats?.overduePayments} contas vencidas</p>
                  </div>
                  <Badge variant="destructive">Urgente</Badge>
                </div>
              )}

              {(stats?.pendingBudgets || 0) > 0 && (
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Orçamentos pendentes</p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.pendingBudgets} orçamentos aguardando aprovação
                    </p>
                  </div>
                  <Badge variant="secondary">Pendente</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = "/dashboard/customers")}
              >
                <Users className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Gerenciar Clientes</div>
                  <div className="text-sm text-muted-foreground">Cadastrar e editar clientes</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = "/dashboard/motorcycles")}
              >
                <Car className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Cadastrar Moto</div>
                  <div className="text-sm text-muted-foreground">Adicionar nova motocicleta</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = "/dashboard/budgets")}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Novo Orçamento</div>
                  <div className="text-sm text-muted-foreground">Criar orçamento</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = "/dashboard/inventory")}
              >
                <Package className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Controle de Estoque</div>
                  <div className="text-sm text-muted-foreground">Gerenciar peças</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
