"use client"

import { useState } from "react"
import { Plus, Search, Eye, Edit, Trash2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { ServiceOrderForm } from "@/components/forms/service-order-form"
import { ServiceOrderDetailsModal } from "@/components/modals/service-order-details-modal"
import { Pagination } from "@/components/ui/pagination"
import { useServiceOrders } from "@/hooks/use-service-orders"
import { usePagination } from "@/hooks/use-pagination"
import type { ServiceOrder } from "@/domain/entities/service-order"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/contexts/toast-context"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
}

export default function ServiceOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null)
  const [serviceOrderToDelete, setServiceOrderToDelete] = useState<ServiceOrder | null>(null)

  const { success, error: showError } = useToast()
  const {
    serviceOrders,
    loading,
    createServiceOrder,
    updateServiceOrder,
    deleteServiceOrder,
    updateServiceOrderStatus,
  } = useServiceOrders()

  // Filter service orders
  const filteredServiceOrders = serviceOrders.filter((serviceOrder) => {
    const matchesSearch =
      serviceOrder.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceOrder.motorcycle_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceOrder.motorcycle_plate?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || serviceOrder.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedServiceOrders,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  } = usePagination({ data: filteredServiceOrders, itemsPerPage: 10 })

  const handleCreateServiceOrder = async (data: any) => {
    const result = await createServiceOrder(data)
    if (result) {
      setIsFormOpen(false)
    }
  }

  const handleUpdateServiceOrder = async (data: any) => {
    if (selectedServiceOrder) {
      const result = await updateServiceOrder(selectedServiceOrder.id, data)
      if (result) {
        setSelectedServiceOrder(null)
        setIsFormOpen(false)
        setIsDetailsOpen(false)
      }
    }
  }

  const handleDeleteServiceOrder = async () => {
    if (serviceOrderToDelete) {
      try {
        const result = await deleteServiceOrder(serviceOrderToDelete.id)
        if (result) {
          success("Sucesso", "Ordem de serviço excluída com sucesso!")
        }
      } catch (error) {
        showError("Erro", "Erro ao excluir ordem de serviço.")
      } finally {
        setServiceOrderToDelete(null)
      }
    }
  }

  const handleStatusChange = async (serviceOrderId: string, newStatus: string) => {
    try {
      const result = await updateServiceOrderStatus(serviceOrderId, newStatus as any)
      if (result) {
        success("Sucesso", "Status atualizado com sucesso!")
      }
    } catch (error) {
      showError("Erro", "Erro ao atualizar status.")
    }
  }

  const handleViewDetails = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder)
    setIsDetailsOpen(true)
  }

  const handleEditServiceOrder = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder)
    setIsFormOpen(true)
  }

  const handleEditFromDetails = (serviceOrder: ServiceOrder) => {
    setIsDetailsOpen(false)
    setIsFormOpen(true)
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || isNaN(value)) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie as ordens de serviço da oficina</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
          <CardDescription>{filteredServiceOrders.length} ordem(ns) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, modelo ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Motocicleta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedServiceOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhuma ordem de serviço encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedServiceOrders.map((serviceOrder) => (
                    <TableRow key={serviceOrder.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{serviceOrder.customer_name || "Cliente não informado"}</p>
                          <p className="text-sm text-gray-500">{serviceOrder.customer_email || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{serviceOrder.motorcycle_model || "Modelo não informado"}</p>
                          <p className="text-sm text-gray-500">{serviceOrder.motorcycle_plate || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={serviceOrder.status}
                          onValueChange={(value) => handleStatusChange(serviceOrder.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={statusColors[serviceOrder.status as keyof typeof statusColors]}>
                              {statusLabels[serviceOrder.status as keyof typeof statusLabels]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {serviceOrder.created_at
                          ? format(new Date(serviceOrder.created_at), "dd/MM/yyyy", { locale: ptBR })
                          : "Data não informada"}
                      </TableCell>
                      <TableCell>{formatCurrency(serviceOrder.total_amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(serviceOrder)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditServiceOrder(serviceOrder)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setServiceOrderToDelete(serviceOrder)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                onPreviousPage={goToPreviousPage}
                onNextPage={goToNextPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceOrderForm
        serviceOrder={selectedServiceOrder}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedServiceOrder(null)
        }}
        onSubmit={selectedServiceOrder ? handleUpdateServiceOrder : handleCreateServiceOrder}
      />

      <ServiceOrderDetailsModal
        serviceOrder={selectedServiceOrder}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedServiceOrder(null)
        }}
        onEdit={handleEditFromDetails}
      />

      <AlertDialog open={!!serviceOrderToDelete} onOpenChange={() => setServiceOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteServiceOrder}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
