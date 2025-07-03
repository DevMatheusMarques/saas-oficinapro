"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { FileText, DollarSign, TrendingUp, Package, Wrench, FileSpreadsheet, FileDown } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useCustomers } from "@/hooks/use-customers"
import { useParts } from "@/hooks/use-parts"
import { useServiceOrders } from "@/hooks/use-service-orders"
import { useBudgets } from "@/hooks/use-budgets"
import { usePayments } from "@/hooks/use-payments"
import { useToast } from "@/contexts/toast-context"

// Cores para os gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales")
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"))

  const { success, error: showError } = useToast()
  const { customers } = useCustomers()
  const { parts } = useParts()
  const { serviceOrders } = useServiceOrders()
  const { budgets } = useBudgets()
  const { payments } = usePayments()

  // Helper functions
  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getNumericValue = (value: any): number => {
    if (value === null || value === undefined || isNaN(Number(value))) return 0
    return Number(value)
  }

  const isInDateRange = (date: string | Date) => {
    if (!startDate || !endDate) return true
    const itemDate = new Date(date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return itemDate >= start && itemDate <= end
  }

  // Filter data by date range
  const filteredServiceOrders = serviceOrders.filter((order) => {
    const orderDate = order.created_at || order.createdAt
    return orderDate ? isInDateRange(orderDate) : false
  })

  const filteredBudgets = budgets.filter((budget) => {
    const budgetDate = budget.created_at || budget.createdAt
    return budgetDate ? isInDateRange(budgetDate) : false
  })

  const filteredPayments = payments.filter((payment) => {
    const paymentDate = payment.created_at || payment.createdAt || payment.paymentDate
    return paymentDate ? isInDateRange(paymentDate) : false
  })

  // Calculate metrics
  const totalRevenue = filteredServiceOrders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + getNumericValue(order.total_amount || order.totalAmount), 0)

  const totalBudgets = filteredBudgets.length
  const approvedBudgets = filteredBudgets.filter((budget) => budget.status === "approved").length
  const conversionRate = totalBudgets > 0 ? (approvedBudgets / totalBudgets) * 100 : 0

  const lowStockParts = parts.filter((part) => {
    const quantity = getNumericValue(part.quantity || part.stockQuantity)
    const minStock = getNumericValue(part.minimum_stock || part.minStockLevel)
    return quantity <= minStock
  })

  // Prepare chart data
  const salesData = filteredServiceOrders
    .filter((order) => order.status === "completed")
    .reduce((acc: any[], order) => {
      const orderDate = order.created_at || order.createdAt
      if (!orderDate) return acc

      const date = format(new Date(orderDate), "dd/MM", { locale: ptBR })
      const existing = acc.find((item) => item.date === date)
      const amount = getNumericValue(order.total_amount || order.totalAmount)

      if (existing) {
        existing.value += amount
      } else {
        acc.push({ date, value: amount })
      }
      return acc
    }, [])
    .slice(-7) // Last 7 days

  const serviceStatusData = [
    { name: "Pendente", value: serviceOrders.filter((o) => o.status === "pending").length },
    { name: "Em Andamento", value: serviceOrders.filter((o) => o.status === "in_progress").length },
    { name: "Concluída", value: serviceOrders.filter((o) => o.status === "completed").length },
    { name: "Cancelada", value: serviceOrders.filter((o) => o.status === "cancelled").length },
  ].filter((item) => item.value > 0)

  const topCustomers = customers
    .map((customer) => {
      const customerOrders = filteredServiceOrders.filter(
        (order) => order.customer_id === customer.id || order.customerId === customer.id,
      )
      const totalSpent = customerOrders.reduce(
        (sum, order) => sum + getNumericValue(order.total_amount || order.totalAmount),
        0,
      )
      return {
        name: customer.name,
        email: customer.email,
        orders: customerOrders.length,
        totalSpent,
      }
    })
    .filter((customer) => customer.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    try {
      if (!data || data.length === 0) {
        showError("Erro", "Não há dados para exportar")
        return
      }

      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              return typeof value === "string" && value.includes(",") ? `"${value}"` : value
            })
            .join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${filename}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      success("Sucesso", "Relatório exportado com sucesso!")
    } catch (error) {
      showError("Erro", "Erro ao exportar relatório")
    }
  }

  const exportToPDF = async (reportData: any, title: string) => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default
      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.text(title, 20, 30)
      doc.setFontSize(12)
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 20, 45)

      if (startDate && endDate) {
        doc.text(
          `Período: ${format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR })} - ${format(
            new Date(endDate),
            "dd/MM/yyyy",
            {
              locale: ptBR,
            },
          )}`,
          20,
          55,
        )
      }

      let yPosition = 70

      // Add summary data
      if (reportType === "sales") {
        doc.text(`Receita Total: ${formatCurrency(totalRevenue)}`, 20, yPosition)
        yPosition += 10
        doc.text(
          `Ordens Concluídas: ${filteredServiceOrders.filter((o) => o.status === "completed").length}`,
          20,
          yPosition,
        )
        yPosition += 10
        doc.text(`Taxa de Conversão: ${conversionRate.toFixed(1)}%`, 20, yPosition)
        yPosition += 20
      }

      // Add table data
      if (reportData && reportData.length > 0) {
        const headers = Object.keys(reportData[0])
        const startY = yPosition

        // Table headers
        doc.setFontSize(10)
        headers.forEach((header, index) => {
          doc.text(header, 20 + index * 30, startY)
        })

        // Table rows
        reportData.slice(0, 20).forEach((row: any, rowIndex: number) => {
          const y = startY + 10 + rowIndex * 8
          headers.forEach((header, colIndex) => {
            const value = row[header]?.toString() || ""
            doc.text(value.substring(0, 15), 20 + colIndex * 30, y)
          })
        })
      }

      doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`)
      success("Sucesso", "Relatório PDF gerado com sucesso!")
    } catch (error) {
      showError("Erro", "Erro ao gerar PDF")
    }
  }

  const getReportData = () => {
    switch (reportType) {
      case "sales":
        return filteredServiceOrders
          .filter((order) => order.status === "completed")
          .map((order) => ({
            Data:
              order.created_at || order.createdAt
                ? format(new Date(order.created_at || order.createdAt), "dd/MM/yyyy", { locale: ptBR })
                : "",
            Cliente: order.customer_name || order.customerName || "",
            Motocicleta: order.motorcycle_model || order.motorcycleModel || "",
            Valor: formatCurrency(getNumericValue(order.total_amount || order.totalAmount)),
            Status: order.status,
          }))
      case "customers":
        return topCustomers.map((customer) => ({
          Nome: customer.name,
          Email: customer.email,
          Pedidos: customer.orders,
          "Total Gasto": formatCurrency(customer.totalSpent),
        }))
      case "inventory":
        return lowStockParts.map((part) => ({
          Nome: part.name,
          Código: part.code || part.partNumber || "",
          Categoria: part.category || "",
          "Estoque Atual": getNumericValue(part.quantity || part.stockQuantity),
          "Estoque Mínimo": getNumericValue(part.minimum_stock || part.minStockLevel),
          "Preço Custo": formatCurrency(getNumericValue(part.cost_price || part.costPrice)),
        }))
      case "services":
        return filteredServiceOrders.map((order) => ({
          Data:
            order.created_at || order.createdAt
              ? format(new Date(order.created_at || order.createdAt), "dd/MM/yyyy", { locale: ptBR })
              : "",
          Cliente: order.customer_name || order.customerName || "",
          Serviço: order.description || "",
          Status: order.status,
          Valor: formatCurrency(getNumericValue(order.total_amount || order.totalAmount)),
        }))
      default:
        return []
    }
  }

  const getReportTitle = () => {
    switch (reportType) {
      case "sales":
        return "Relatório de Vendas"
      case "customers":
        return "Relatório de Clientes"
      case "inventory":
        return "Relatório de Estoque"
      case "services":
        return "Relatório de Serviços"
      default:
        return "Relatório"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada do desempenho da oficina</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => exportToCSV(getReportData(), getReportTitle())}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToPDF(getReportData(), getReportTitle())}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="customers">Clientes</SelectItem>
                  <SelectItem value="inventory">Estoque</SelectItem>
                  <SelectItem value="services">Serviços</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens Concluídas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredServiceOrders.filter((order) => order.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Serviços finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Orçamentos aprovados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockParts.length}</div>
            <p className="text-xs text-muted-foreground">Peças com baixo estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Vendas"]} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Serviços</CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>{getReportTitle()}</CardTitle>
          <CardDescription>Dados detalhados do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {getReportData().length > 0 &&
                    Object.keys(getReportData()[0]).map((header) => <TableHead key={header}>{header}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getReportData().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Nenhum dado encontrado para o período selecionado
                    </TableCell>
                  </TableRow>
                ) : (
                  getReportData()
                    .slice(0, 20)
                    .map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{value as string}</TableCell>
                        ))}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
          {getReportData().length > 20 && (
            <p className="text-sm text-muted-foreground mt-4">
              Mostrando 20 de {getReportData().length} registros. Use a exportação para ver todos os dados.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
