"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, FileText, Clock, CheckCircle, XCircle, Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useBudgets } from "@/hooks/use-budgets"
import { useCustomers } from "@/hooks/use-customers"
import { useMotorcycles } from "@/hooks/use-motorcycles"
import { usePagination } from "@/hooks/use-pagination"
import { BudgetForm } from "@/components/forms/budget-form"
import { BudgetDetailsModal } from "@/components/modals/budget-details-modal"

export default function BudgetsPage() {
  const { budgets, loading, createBudget, updateBudget, deleteBudget, approveBudget, rejectBudget } = useBudgets()
  const { customers } = useCustomers()
  const { motorcycles } = useMotorcycles()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline">
            <FileText className="h-3 w-3 mr-1" />
            Rascunho
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "approved":
        return (
          <Badge>
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeitado
          </Badge>
        )
      case "completed":
        return (
          <Badge>
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const filteredBudgets = budgets.filter((budget) => {
    const customer = customers.find((c) => c.id === budget.customerId)
    const motorcycle = motorcycles.find((m) => m.id === budget.motorcycleId)

    const matchesSearch =
      budget.budgetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${motorcycle?.brand} ${motorcycle?.model}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || budget.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: filteredBudgets, itemsPerPage: 10 })

  const handleCreateBudget = async (data: any) => {
    const result = await createBudget(data)
    if (result) {
      setIsCreateModalOpen(false)
    }
  }

  const handleUpdateBudget = async (data: any) => {
    if (selectedBudget) {
      const result = await updateBudget(selectedBudget.id, data)
      if (result) {
        setIsEditModalOpen(false)
        setSelectedBudget(null)
      }
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      await deleteBudget(id)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === "approved") {
      await approveBudget(id)
    } else if (newStatus === "rejected") {
      await rejectBudget(id)
    } else {
      await updateBudget(id, { status: newStatus as any })
    }
  }

  const pendingBudgets = budgets.filter((b) => b.status === "pending").length
  const approvedBudgets = budgets.filter((b) => b.status === "approved").length
  const totalValue = budgets.reduce((sum, b) => sum + b.totalAmount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
            <p className="text-muted-foreground">Gerencie orçamentos e propostas de serviços</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Orçamento</DialogTitle>
                <DialogDescription>Preencha os dados para criar um novo orçamento</DialogDescription>
              </DialogHeader>
              <BudgetForm
                customers={customers}
                motorcycles={motorcycles}
                onSubmit={handleCreateBudget}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgets.length}</div>
              <p className="text-xs text-muted-foreground">Orçamentos criados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBudgets}</div>
              <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedBudgets}</div>
              <p className="text-xs text-muted-foreground">Prontos para execução</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">Valor em orçamentos</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Orçamentos</CardTitle>
            <CardDescription>
              Mostrando {startIndex} a {endIndex} de {totalItems} orçamentos
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar orçamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Moto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((budget) => {
                      const customer = customers.find((c) => c.id === budget.customerId)
                      const motorcycle = motorcycles.find((m) => m.id === budget.motorcycleId)

                      return (
                        <TableRow key={budget.id}>
                          <TableCell className="font-medium">{budget.budgetNumber}</TableCell>
                          <TableCell>{customer?.name || "Cliente não encontrado"}</TableCell>
                          <TableCell>
                            {motorcycle ? `${motorcycle.brand} ${motorcycle.model}` : "Moto não encontrada"}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={budget.status}
                              onValueChange={(value) => handleStatusChange(budget.id, value)}
                            >
                              <SelectTrigger className="w-[130px]">{getStatusBadge(budget.status)}</SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Rascunho</SelectItem>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="approved">Aprovado</SelectItem>
                                <SelectItem value="rejected">Rejeitado</SelectItem>
                                <SelectItem value="completed">Concluído</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatCurrency(budget.totalAmount)}</TableCell>
                          <TableCell>{budget.createdAt.toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBudget(budget)
                                    setIsDetailsModalOpen(true)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBudget(budget)
                                    setIsEditModalOpen(true)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteBudget(budget.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={goToPreviousPage}
                            className={!hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => goToPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={goToNextPage}
                            className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Orçamento</DialogTitle>
              <DialogDescription>Edite os dados do orçamento selecionado</DialogDescription>
            </DialogHeader>
            {selectedBudget && (
              <BudgetForm
                customers={customers}
                motorcycles={motorcycles}
                initialData={selectedBudget}
                onSubmit={handleUpdateBudget}
                onCancel={() => {
                  setIsEditModalOpen(false)
                  setSelectedBudget(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Details Modal */}
        <BudgetDetailsModal
          budget={selectedBudget}
          customer={selectedBudget ? customers.find((c) => c.id === selectedBudget.customerId) : undefined}
          motorcycle={selectedBudget ? motorcycles.find((m) => m.id === selectedBudget.motorcycleId) : undefined}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedBudget(null)
          }}
        />
      </div>
    </DashboardLayout>
  )
}
