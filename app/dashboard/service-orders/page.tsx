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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Plus,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Play,
  Package,
} from "lucide-react"
import { useServiceOrders } from "@/hooks/use-service-orders"
import { useCustomers } from "@/hooks/use-customers"
import { useMotorcycles } from "@/hooks/use-motorcycles"
import { usePagination } from "@/hooks/use-pagination"
import { ServiceOrderForm } from "@/components/forms/service-order-form"
import { ServiceOrderDetailsModal } from "@/components/modals/service-order-details-modal"

export default function ServiceOrdersPage() {
  const {
    serviceOrders,
    loading,
    createServiceOrder,
    updateServiceOrder,
    deleteServiceOrder,
    startServiceOrder,
    completeServiceOrder,
    deliverServiceOrder,
  } = useServiceOrders()
  const { customers } = useCustomers()
  const { motorcycles } = useMotorcycles()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Aberta
          </Badge>
        )
      case "in_progress":
        return (
          <Badge>
            <Wrench className="h-3 w-3 mr-1" />
            Em Andamento
          </Badge>
        )
      case "waiting_parts":
        return (
          <Badge variant="outline">
            <Pause className="h-3 w-3 mr-1" />
            Aguardando Peças
          </Badge>
        )
      case "completed":
        return (
          <Badge>
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      case "delivered":
        return (
          <Badge>
            <CheckCircle className="h-3 w-3 mr-1" />
            Entregue
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredServiceOrders = serviceOrders.filter((order) => {
    const customer = customers.find((c) => c.id === order.customerId)
    const motorcycle = motorcycles.find((m) => m.id === order.motorcycleId)

    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${motorcycle?.brand} ${motorcycle?.model}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus

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
  } = usePagination({ data: filteredServiceOrders, itemsPerPage: 10 })

  const handleCreateServiceOrder = async (data: any) => {
    const result = await createServiceOrder(data)
    if (result) {
      setIsCreateModalOpen(false)
    }
  }

  const handleUpdateServiceOrder = async (data: any) => {
    if (selectedServiceOrder) {
      const result = await updateServiceOrder(selectedServiceOrder.id, data)
      if (result) {
        setIsEditModalOpen(false)
        setSelectedServiceOrder(null)
      }
    }
  }

  const handleDeleteServiceOrder = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) {
      await deleteServiceOrder(id)
    }
  }

  const handleStartServiceOrder = async (id: string) => {
    if (confirm("Tem certeza que deseja iniciar esta ordem de serviço?")) {
      await startServiceOrder(id)
    }
  }

  const handleCompleteServiceOrder = async (id: string) => {
    if (confirm("Tem certeza que deseja concluir esta ordem de serviço?")) {
      await completeServiceOrder(id)
    }
  }

  const handleDeliverServiceOrder = async (id: string) => {
    if (confirm("Tem certeza que deseja marcar como entregue?")) {
      await deliverServiceOrder(id)
    }
  }

  const handleViewDetails = (order: any) => {
    setSelectedServiceOrder(order)
    setIsDetailsModalOpen(true)
  }

  const inProgressOrders = serviceOrders.filter((o) => o.status === "in_progress").length
  const waitingPartsOrders = serviceOrders.filter((o) => o.status === "waiting_parts").length
  const completedOrders = serviceOrders.filter((o) => o.status === "completed").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
            <p className="text-muted-foreground">Gerencie as ordens de serviço em andamento</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Ordem de Serviço</DialogTitle>
                <DialogDescription>Preencha os dados para criar uma nova ordem de serviço</DialogDescription>
              </DialogHeader>
              <ServiceOrderForm
                customers={customers}
                motorcycles={motorcycles}
                onSubmit={handleCreateServiceOrder}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceOrders.length}</div>
              <p className="text-xs text-muted-foreground">Ordens criadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressOrders}</div>
              <p className="text-xs text-muted-foreground">Sendo executadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguardando Peças</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waitingPartsOrders}</div>
              <p className="text-xs text-muted-foreground">Pendentes de peças</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">Finalizadas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Ordens de Serviço</CardTitle>
            <CardDescription>
              Mostrando {startIndex} a {endIndex} de {totalItems} ordens de serviço
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ordens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todos os Status</option>
                <option value="open">Aberta</option>
                <option value="in_progress">Em Andamento</option>
                <option value="waiting_parts">Aguardando Peças</option>
                <option value="completed">Concluída</option>
                <option value="delivered">Entregue</option>
              </select>
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
                      <TableHead>Início</TableHead>
                      <TableHead>Previsão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((order) => {
                      const customer = customers.find((c) => c.id === order.customerId)
                      const motorcycle = motorcycles.find((m) => m.id === order.motorcycleId)

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{customer?.name || "Cliente não encontrado"}</TableCell>
                          <TableCell>
                            {motorcycle ? `${motorcycle.brand} ${motorcycle.model}` : "Moto não encontrada"}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{order.startDate ? order.startDate.toLocaleDateString("pt-BR") : "-"}</TableCell>
                          <TableCell>
                            {order.estimatedCompletion ? order.estimatedCompletion.toLocaleDateString("pt-BR") : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedServiceOrder(order)
                                    setIsEditModalOpen(true)
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                {order.status === "open" && (
                                  <DropdownMenuItem onClick={() => handleStartServiceOrder(order.id)}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Iniciar
                                  </DropdownMenuItem>
                                )}
                                {(order.status === "in_progress" || order.status === "waiting_parts") && (
                                  <DropdownMenuItem onClick={() => handleCompleteServiceOrder(order.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Concluir
                                  </DropdownMenuItem>
                                )}
                                {order.status === "completed" && (
                                  <DropdownMenuItem onClick={() => handleDeliverServiceOrder(order.id)}>
                                    <Package className="mr-2 h-4 w-4" />
                                    Entregar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteServiceOrder(order.id)}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Ordem de Serviço</DialogTitle>
              <DialogDescription>Edite os dados da ordem de serviço selecionada</DialogDescription>
            </DialogHeader>
            {selectedServiceOrder && (
              <ServiceOrderForm
                customers={customers}
                motorcycles={motorcycles}
                initialData={selectedServiceOrder}
                onSubmit={handleUpdateServiceOrder}
                onCancel={() => {
                  setIsEditModalOpen(false)
                  setSelectedServiceOrder(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Details Modal */}
        <ServiceOrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedServiceOrder(null)
          }}
          serviceOrder={selectedServiceOrder}
          customer={selectedServiceOrder ? customers.find((c) => c.id === selectedServiceOrder.customerId) : null}
          motorcycle={selectedServiceOrder ? motorcycles.find((m) => m.id === selectedServiceOrder.motorcycleId) : null}
        />
      </div>
    </DashboardLayout>
  )
}
