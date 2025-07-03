"use client"

import { useState } from "react"
import { Plus, Download, FileText, BarChart3, DollarSign, Package, Users, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/contexts/toast-context"
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

  const { success, error } = useToast()
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
            customer.name || "N/A",
            customer.email || "N/A",
            customer.phone || "N/A",
            customer.created_at ? format(new Date(customer.created_at), "dd/MM/yyyy", { locale: ptBR }) : "N/A",
          ]),
        }

      case "inventory":
        return {
          title: "Relatório de Estoque",
          headers: ["Peça", "Código", "Categoria", "Estoque Atual", "Estoque Mínimo", "Status", "Valor Total"],
          data: parts.map((part) => {
            const quantity = part.quantity || part.stockQuantity || 0
            const minStock = part.minimum_stock || part.minStockLevel || 0
            const costPrice = part.cost_price || part.costPrice || 0
            const status = quantity === 0 ? "Sem estoque" : quantity <= minStock ? "Estoque baixo" : "Normal"
            return [
              part.name || "N/A",
              part.code || part.partNumber || "N/A",
              part.category || "N/A",
              `${quantity} ${part.unit || "un"}`,
              `${minStock} ${part.unit || "un"}`,
              status,
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(quantity * costPrice),
            ]
          }),
        }

      case "financial":
        const filteredPayments = payments.filter((payment) => {
          const paymentDate = new Date(payment.created_at || payment.paymentDate)
          return paymentDate >= startDateObj && paymentDate <= endDateObj
        })

        const totalReceived = filteredPayments
          .filter((p) => p.type === "received" || p.type === "income")
          .reduce((sum, p) => sum + (p.amount || 0), 0)

        const totalPaid = filteredPayments
          .filter((p) => p.type === "paid" || p.type === "expense")
          .reduce((sum, p) => sum + (p.amount || 0), 0)

        return {
          title: `Relatório Financeiro - ${format(startDateObj, "dd/MM/yyyy", { locale: ptBR })} a ${format(endDateObj, "dd/MM/yyyy", { locale: ptBR })}`,
          headers: ["Descrição", "Tipo", "Valor", "Data", "Status"],
          data: [
            ...filteredPayments.map((payment) => [
              payment.description || "N/A",
              payment.type === "received" || payment.type === "income" ? "Recebimento" : "Pagamento",
              new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payment.amount || 0),
              payment.created_at ? format(new Date(payment.created_at), "dd/MM/yyyy", { locale: ptBR }) : "N/A",
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
          const serviceDate = new Date(service.created_at || service.createdAt)
          return serviceDate >= startDateObj && serviceDate <= endDateObj
        })

        return {
          title: `Relatório de Serviços - ${format(startDateObj, "dd/MM/yyyy", { locale: ptBR })} a ${format(endDateObj, "dd/MM/yyyy", { locale: ptBR })}`,
          headers: ["Cliente", "Motocicleta", "Status", "Valor", "Data"],
          data: filteredServices.map((service) => [
            service.customer_name || service.customerName || "N/A",
            `${service.motorcycle_model || service.motorcycleModel || "N/A"} - ${service.motorcycle_plate || service.motorcyclePlate || "N/A"}`,
            service.status === "pending"
              ? "Pendente"
              : service.status === "in_progress"
                ? "Em Andamento"
                : service.status === "completed"
                  ? "Concluída"
                  : "Cancelada",
            new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              service.total_amount || service.totalAmount || 0,
            ),
            service.created_at ? format(new Date(service.created_at), "dd/MM/yyyy", { locale: ptBR }) : "N/A",
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
    if (reportData.data.length === 0) {
      error("Erro", "Não há dados para gerar o relatório")
      return
    }

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

  const downloadPDF = async (reportData: ReportData) => {
    if (reportData.data.length === 0) {
      error("Erro", "Não há dados para gerar o relatório")
      return
    }

    try {
      // Importar jsPDF dinamicamente
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      // Título
      doc.setFontSize(16)
      doc.text(reportData.title, 20, 20)

      // Data de geração
      doc.setFontSize(10)
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, 30)

      // Cabeçalhos
      let yPosition = 50
      doc.setFontSize(12)
      doc.setFont(undefined, "bold")

      const columnWidth = 180 / reportData.headers.length
      reportData.headers.forEach((header, index) => {
        doc.text(header, 20 + index * columnWidth, yPosition)
      })

      // Dados
      doc.setFont(undefined, "normal")
      doc.setFontSize(10)
      yPosition += 10

      reportData.data.forEach((row, rowIndex) => {
        if (yPosition > 270) {
          // Nova página se necessário
          doc.addPage()
          yPosition = 20
        }

        row.forEach((cell, cellIndex) => {
          const text = String(cell).substring(0, 25) // Limitar texto
          doc.text(text, 20 + cellIndex * columnWidth, yPosition)
        })
        yPosition += 8
      })

      doc.save(`${reportData.title.replace(/\s+/g, "_")}.pdf`)
      success("Sucesso", "Relatório PDF gerado com sucesso!")
    } catch (err) {
      error("Erro", "Erro ao gerar PDF. Baixando como CSV...")
      downloadCSV(reportData)
    }
  }

  const handleQuickReport = async (type: string, format: "csv" | "pdf" = "csv") => {
    setIsGenerating(true)
    try {
      const reportData = generateReportData(type)
      if (format === "pdf") {
        await downloadPDF(reportData)
      } else {
        downloadCSV(reportData)
      }
      success("Sucesso", `Relatório ${format.toUpperCase()} gerado e baixado com sucesso!`)
    } catch (err) {
      error("Erro", "Erro ao gerar relatório.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCustomReport = async (format: "csv" | "pdf" = "csv") => {
    if (!reportType) {
      error("Erro", "Selecione o tipo de relatório.")
      return
    }

    setIsGenerating(true)
    try {
      const reportData = generateReportData(reportType, startDate, endDate)
      if (format === "pdf") {
        await downloadPDF(reportData)
      } else {
        downloadCSV(reportData)
      }
      success("Sucesso", `Relatório personalizado ${format.toUpperCase()} gerado com sucesso!`)
      setIsNewReportOpen(false)
    } catch (err) {
      error("Erro", "Erro ao gerar relatório personalizado.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
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
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Relatórios Rápidos</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickReports.map((report) => (
            <Card key={report.type} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                <div className={`p-2 rounded-md ${report.color}`}>
                  <report.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{report.description}</CardDescription>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReport(report.type, "csv")}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReport(report.type, "pdf")}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Estatísticas Gerais</h2>
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
              <Button onClick={() => handleCustomReport("csv")} disabled={isGenerating}>
                {isGenerating ? "Gerando..." : "CSV"}
              </Button>
              <Button onClick={() => handleCustomReport("pdf")} disabled={isGenerating}>
                {isGenerating ? "Gerando..." : "PDF"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
