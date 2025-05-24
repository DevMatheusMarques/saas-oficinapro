"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, BarChart3, FileText, Download, TrendingUp, Users, Car, DollarSign, Plus } from "lucide-react"
import { useCustomers } from "@/hooks/use-customers"
import { useServiceOrders } from "@/hooks/use-service-orders"
import { usePayments } from "@/hooks/use-payments"
import { useParts } from "@/hooks/use-parts"

export default function ReportsPage() {
  const { customers } = useCustomers()
  const { serviceOrders } = useServiceOrders()
  const { payments } = usePayments()
  const { parts } = useParts()
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  })

  const reports = [
    {
      id: "sales",
      title: "Relatório de Vendas",
      description: "Vendas por período e cliente",
      icon: DollarSign,
      lastGenerated: "2024-01-15",
      type: "sales",
    },
    {
      id: "customers",
      title: "Relatório de Clientes",
      description: "Lista completa de clientes e histórico",
      icon: Users,
      lastGenerated: "2024-01-14",
      type: "customers",
    },
    {
      id: "inventory",
      title: "Relatório de Estoque",
      description: "Movimentação e status do estoque",
      icon: BarChart3,
      lastGenerated: "2024-01-13",
      type: "inventory",
    },
    {
      id: "services",
      title: "Relatório de Serviços",
      description: "Ordens de serviço e produtividade",
      icon: Car,
      lastGenerated: "2024-01-12",
      type: "services",
    },
  ]

  const generateQuickReport = (type: string) => {
    let reportData = ""
    const today = new Date().toLocaleDateString("pt-BR")

    switch (type) {
      case "monthly-revenue":
        const monthlyRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
        reportData = `Relatório de Faturamento do Mês - ${today}\n\n`
        reportData += `Total de Recebimentos: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(monthlyRevenue)}\n`
        reportData += `Número de Pagamentos: ${payments.length}\n`
        break

      case "new-customers":
        const newCustomers = customers.filter((c) => {
          const createdDate = new Date(c.createdAt || "")
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return createdDate >= thirtyDaysAgo
        })
        reportData = `Relatório de Novos Clientes - ${today}\n\n`
        reportData += `Novos clientes nos últimos 30 dias: ${newCustomers.length}\n`
        reportData += `Total de clientes: ${customers.length}\n`
        break

      case "completed-services":
        const completedServices = serviceOrders.filter((so) => so.status === "completed" || so.status === "delivered")
        reportData = `Relatório de Serviços Concluídos - ${today}\n\n`
        reportData += `Serviços concluídos: ${completedServices.length}\n`
        reportData += `Total de ordens: ${serviceOrders.length}\n`
        break

      case "top-parts":
        const lowStockParts = parts.filter((p) => p.stockQuantity <= p.minStockLevel)
        reportData = `Relatório de Peças Mais Vendidas - ${today}\n\n`
        reportData += `Peças com baixo estoque: ${lowStockParts.length}\n`
        reportData += `Total de peças: ${parts.length}\n`
        break
    }

    // Simular download do relatório
    const blob = new Blob([reportData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${type}-${today.replace(/\//g, "-")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateCustomReport = () => {
    if (!selectedReportType) {
      alert("Selecione um tipo de relatório")
      return
    }

    let reportData = ""
    const today = new Date().toLocaleDateString("pt-BR")

    switch (selectedReportType) {
      case "sales":
        const totalSales = payments.reduce((sum, p) => sum + p.amount, 0)
        reportData = `Relatório de Vendas - ${today}\n\n`
        reportData += `Período: ${dateRange.startDate || "Início"} até ${dateRange.endDate || "Hoje"}\n`
        reportData += `Total de Vendas: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalSales)}\n`
        reportData += `Número de Transações: ${payments.length}\n\n`
        reportData += "Detalhes dos Pagamentos:\n"
        payments.forEach((payment, index) => {
          const customer = customers.find((c) => c.id === payment.customerId)
          reportData += `${index + 1}. ${customer?.name || "Cliente não encontrado"} - ${new Intl.NumberFormat(
            "pt-BR",
            { style: "currency", currency: "BRL" },
          ).format(payment.amount)} - ${payment.paymentDate.toLocaleDateString("pt-BR")}\n`
        })
        break

      case "customers":
        reportData = `Relatório de Clientes - ${today}\n\n`
        reportData += `Total de Clientes: ${customers.length}\n\n`
        reportData += "Lista de Clientes:\n"
        customers.forEach((customer, index) => {
          reportData += `${index + 1}. ${customer.name}\n`
          reportData += `   Email: ${customer.email}\n`
          reportData += `   Telefone: ${customer.phone}\n`
          reportData += `   Cadastrado em: ${new Date(customer.createdAt || "").toLocaleDateString("pt-BR")}\n\n`
        })
        break

      case "inventory":
        const totalValue = parts.reduce((sum, part) => sum + part.stockQuantity * part.costPrice, 0)
        const lowStock = parts.filter((p) => p.stockQuantity <= p.minStockLevel)
        reportData = `Relatório de Estoque - ${today}\n\n`
        reportData += `Total de Peças: ${parts.length}\n`
        reportData += `Valor Total em Estoque: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalValue)}\n`
        reportData += `Peças com Baixo Estoque: ${lowStock.length}\n\n`
        reportData += "Peças com Baixo Estoque:\n"
        lowStock.forEach((part, index) => {
          reportData += `${index + 1}. ${part.name} - Estoque: ${part.stockQuantity} (Mín: ${part.minStockLevel})\n`
        })
        break

      case "services":
        const inProgress = serviceOrders.filter((so) => so.status === "in_progress").length
        const completed = serviceOrders.filter((so) => so.status === "completed" || so.status === "delivered").length
        reportData = `Relatório de Serviços - ${today}\n\n`
        reportData += `Total de Ordens: ${serviceOrders.length}\n`
        reportData += `Em Andamento: ${inProgress}\n`
        reportData += `Concluídas: ${completed}\n\n`
        reportData += "Ordens de Serviço:\n"
        serviceOrders.forEach((order, index) => {
          const customer = customers.find((c) => c.id === order.customerId)
          reportData += `${index + 1}. OS ${order.orderNumber} - ${customer?.name || "Cliente não encontrado"} - Status: ${order.status}\n`
        })
        break
    }

    // Simular download do relatório
    const blob = new Blob([reportData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-${selectedReportType}-${today.replace(/\//g, "-")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsCreateReportModalOpen(false)
    setSelectedReportType("")
    setDateRange({ startDate: "", endDate: "" })
  }

  const downloadReport = (reportId: string) => {
    generateCustomReport()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">Gere relatórios personalizados do seu negócio</p>
          </div>
          <Dialog open={isCreateReportModalOpen} onOpenChange={setIsCreateReportModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerar Novo Relatório</DialogTitle>
                <DialogDescription>Configure os parâmetros para gerar um relatório personalizado</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Tipo de Relatório</Label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de relatório" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Relatório de Vendas</SelectItem>
                      <SelectItem value="customers">Relatório de Clientes</SelectItem>
                      <SelectItem value="inventory">Relatório de Estoque</SelectItem>
                      <SelectItem value="services">Relatório de Serviços</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateReportModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={generateCustomReport}>Gerar Relatório</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios Disponíveis</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">Tipos de relatório</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerados Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Relatórios hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mais Usado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Vendas</div>
              <p className="text-xs text-muted-foreground">Relatório popular</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Relatórios Disponíveis</TabsTrigger>
            <TabsTrigger value="quick">Relatórios Rápidos</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
                <CardDescription>Selecione um relatório para gerar ou visualizar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <report.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{report.title}</div>
                          <div className="text-sm text-muted-foreground">{report.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Último: {new Date(report.lastGenerated).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReportType(report.id)
                              setIsCreateReportModalOpen(true)
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Gerar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => downloadReport(report.id)}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Rápidos</CardTitle>
                <CardDescription>Gere relatórios com dados atuais instantaneamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateQuickReport("monthly-revenue")}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Faturamento do Mês
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateQuickReport("new-customers")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Novos Clientes
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateQuickReport("completed-services")}
                >
                  <Car className="mr-2 h-4 w-4" />
                  Serviços Concluídos
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => generateQuickReport("top-parts")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Peças Mais Vendidas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
