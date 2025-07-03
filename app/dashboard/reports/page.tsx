"use client"

import { useState } from "react"
import { Plus, Download, FileText, BarChart3, DollarSign, Package, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useCustomers } from "@/hooks/use-customers"
import { useParts } from "@/hooks/use-parts"
import { useServiceOrders } from "@/hooks/use-service-orders"
import { usePayments } from "@/hooks/use-payments"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ReportData {
  title: string
  data: any[]
  headers: string[]
}

export default function ReportsPage() {
  const [isNewReportOpen, setIsNewReportOpen] = useState(false)
  const [reportType, setReportType] = useState("")
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))
  const [isGenerating, setIsGenerating] = useState(false)

  const { toast } = useToast()
  const { customers } = useCustomers()
  const { parts } = useParts()
  const { serviceOrders } = useServiceOrders()
  const { payments } = usePayments()

  const quickReports = [
    {
      title: "Relatório de Clientes",
      description: "Lista completa de clientes cadastrados",
      icon: Users,
      type: "customers",
      color: "bg-blue-500",
    },
    {
      title: "Relatório de Estoque",
      description: "Situação atual do estoque de peças",
      icon: Package,
      type: "inventory",
      color: "bg-green-500",
    },
    {
      title: "Relatório Financeiro",
      description: "Resumo financeiro do período",
      icon: DollarSign,
      type: "financial",
      color: "bg-yellow-500",
    },
    {
      title: "Relatório de Serviços",
      description: "Ordens de serviço do período",
      icon: FileText,
      type: "services",
      color: "bg-purple-500",
    },
  ]

  const generateReportData = (type: string, start?: string, end?: string): ReportData => {
    const startDateObj = start ? new Date(start) : subDays(new Date(), 30)
    const endDateObj = end ? new Date(end) : new Date()

    switch (type) {
      case "customers":
        return {
          title: "Relatório de Clientes",
          headers: ["Nome", "Email", "Telefone", "Data de Cadastro"],
          data: customers.map((customer) => [
            customer.name,
            customer.email,
            customer.phone,
            format(new Date(customer.created_at), "dd/MM/yyyy", { locale: ptBR }),
          ]),
        }

      case "inventory":
        return {
          title: "Relatório de Estoque",
          headers: ["Peça", "Código", "Categoria", "Estoque Atual", "Estoque Mínimo", "Status", "Valor Total"],
          data: parts.map((part) => {
            const status =
              part.quantity === 0 ? "Sem estoque" : part.quantity <= part.minimum_stock ? "Estoque baixo" : "Normal"
            return [
              part.name,
              part.code,
              part.category,
              `${part.quantity} ${part.unit}`,
              `${part.minimum_stock} ${part.unit}`,
              status,
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                part.quantity * part.cost_price,
              ),
            ]
          }),
        }

      case "financial":
        const filteredPayments = payments.filter((payment) => {
          const paymentDate = new Date(payment.created_at)
          return paymentDate >= startDateObj && paymentDate <= endDateObj
        })

        const totalReceived = filteredPayments
          .filter((p) => p.type === "received")
          .reduce((sum, p) => sum + p.amount, 0)

        const totalPaid = filteredPayments.filter((p) => p.type === "paid").reduce((sum, p) => sum + p.amount, 0)

        return {
          title: `Relatório Financeiro - ${format(startDateObj, "dd/MM/yyyy", { locale: ptBR })} a ${format(endDateObj, "dd/MM/yyyy", { locale: ptBR })}`,
          headers: ["Descrição", "Tipo", "Valor", "Data", "Status"],
          data: [
            ...filteredPayments.map((payment) => [
              payment.description,
              payment.type === "received" ? "Recebimento" : "Pagamento",
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payment.amount),
              format(new Date(payment.created_at), "dd/MM/yyyy", { locale: ptBR }),
              payment.status === "paid" ? "Pago" : payment.status === "pending" ? "Pendente" : "Cancelado",
            ]),
            ["", "", "", "", ""],
            [
              "TOTAL RECEBIDO",
              "",
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalReceived),
              "",
              "",
            ],
            [
              "TOTAL PAGO",
              "",
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPaid),
              "",
              "",
            ],
            [
              "SALDO",
              "",
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalReceived - totalPaid),
              "",
              "",
            ],
          ],
        }

      case "services":
        const filteredServices = serviceOrders.filter((service) => {
          const serviceDate = new Date(service.created_at)
          return serviceDate >= startDateObj && serviceDate <= endDateObj
        })

        return {
          title: `Relatório de Serviços - ${format(startDateObj, "dd/MM/yyyy", { locale: ptBR })} a ${format(endDateObj, "dd/MM/yyyy", { locale: ptBR })}`,
          headers: ["Cliente", "Motocicleta", "Status", "Valor", "Data"],
          data: filteredServices.map((service) => [
            service.customer_name,
            `${service.motorcycle_model} - ${service.motorcycle_plate}`,
            service.status === "pending"
              ? "Pendente"
              : service.status === "in_progress"
                ? "Em Andamento"
                : service.status === "completed"
                  ? "Concluída"
                  : "Cancelada",
            new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(service.total_amount),
            format(new Date(service.created_at), "dd/MM/yyyy", { locale: ptBR }),
          ]),
        }

      default:
        return {
          title: "Relatório",
          headers: [],
          data: [],
        }
    }
  }

  const downloadCSV = (reportData: ReportData) => {
    const csvContent = [
      reportData.headers.join(","),
      ...reportData.data.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportData.title.replace(/\s+/g, "_")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleQuickReport = async (type: string) => {
    setIsGenerating(true)
    try {
      const reportData = generateReportData(type)
      downloadCSV(reportData)
      toast({
        title: "Sucesso",
        description: "Relatório gerado e baixado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCustomReport = async () => {
    if (!reportType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de relatório.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const reportData = generateReportData(reportType, startDate, endDate)
      downloadCSV(reportData)
      toast({
        title: "Sucesso",
        description: "Relatório personalizado gerado com sucesso!",
      })
      setIsNewReportOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório personalizado.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Gere relatórios detalhados do seu negócio</p>
        </div>
        <Button onClick={() => setIsNewReportOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Relatório
        </Button>
      </div>

      {/* Quick Reports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Relatórios Rápidos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickReports.map((report) => (
            <Card key={report.type} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                <div className={`p-2 rounded-md ${report.color}`}>
                  <report.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{report.description}</CardDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReport(report.type)}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isGenerating ? "Gerando..." : "Baixar"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Estatísticas Gerais</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peças em Estoque</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom Report Dialog */}
      <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Relatório Personalizado</DialogTitle>
            <DialogDescription>Configure os parâmetros do seu relatório personalizado</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customers">Clientes</SelectItem>
                  <SelectItem value="inventory">Estoque</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="services">Serviços</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(reportType === "financial" || reportType === "services") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsNewReportOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCustomReport} disabled={isGenerating}>
                {isGenerating ? "Gerando..." : "Gerar Relatório"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
