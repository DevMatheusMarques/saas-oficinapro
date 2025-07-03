"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  DollarSign,
} from "lucide-react"
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
import { PartForm } from "@/components/forms/part-form"
import { PartDetailsModal } from "@/components/modals/part-details-modal"
import { StockEntryForm } from "@/components/forms/stock-entry-form"
import { Pagination } from "@/components/ui/pagination"
import { useParts } from "@/hooks/use-parts"
import { usePagination } from "@/hooks/use-pagination"
import type { Part } from "@/domain/entities/part"
import { useToast } from "@/contexts/toast-context"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [isPartFormOpen, setIsPartFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isStockEntryOpen, setIsStockEntryOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [partToDelete, setPartToDelete] = useState<Part | null>(null)

  const { success, error: showError } = useToast()
  const { parts, loading, createPart, updatePart, deletePart, updatePartStock } = useParts()

  // Helper function to safely format currency
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "R$ 0,00"
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Helper function to safely get numeric values
  const getNumericValue = (value: any): number => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 0
    }
    return Number(value)
  }

  // Get unique categories
  const categories = Array.from(new Set(parts.map((part) => part.category).filter(Boolean))).sort()

  // Filter parts
  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || part.category === categoryFilter

    let matchesStock = true
    const quantity = getNumericValue(part.quantity)
    const minStock = getNumericValue(part.minimum_stock)

    if (stockFilter === "low") {
      matchesStock = quantity <= minStock && quantity > 0
    } else if (stockFilter === "out") {
      matchesStock = quantity === 0
    }

    return matchesSearch && matchesCategory && matchesStock
  })

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedParts,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  } = usePagination({ data: filteredParts, itemsPerPage: 10 })

  // Calculate stats
  const lowStockCount = parts.filter((part) => {
    const quantity = getNumericValue(part.quantity)
    const minStock = getNumericValue(part.minimum_stock)
    return quantity <= minStock && quantity > 0
  }).length

  const outOfStockCount = parts.filter((part) => getNumericValue(part.quantity) === 0).length

  const totalValue = parts.reduce((sum, part) => {
    const quantity = getNumericValue(part.quantity)
    const costPrice = getNumericValue(part.cost_price)
    return sum + quantity * costPrice
  }, 0)

  const handleCreatePart = async (data: any) => {
    const result = await createPart(data)
    if (result) {
      setIsPartFormOpen(false)
    }
  }

  const handleUpdatePart = async (data: any) => {
    if (selectedPart) {
      const result = await updatePart(selectedPart.id, data)
      if (result) {
        setSelectedPart(null)
        setIsPartFormOpen(false)
        setIsDetailsOpen(false)
      }
    }
  }

  const handleDeletePart = async () => {
    if (partToDelete) {
      try {
        const result = await deletePart(partToDelete.id)
        if (result) {
          success("Sucesso", "Peça excluída com sucesso!")
        }
      } catch (error) {
        showError("Erro", "Erro ao excluir peça.")
      } finally {
        setPartToDelete(null)
      }
    }
  }

  const handleStockEntry = async (data: any) => {
    try {
      const part = parts.find((p) => p.id === data.part_id)
      if (!part) return

      const currentQuantity = getNumericValue(part.quantity)
      const entryQuantity = getNumericValue(data.quantity)
      const newQuantity = data.type === "entry" ? currentQuantity + entryQuantity : currentQuantity - entryQuantity

      if (newQuantity < 0) {
        showError("Erro", "Quantidade insuficiente em estoque.")
        return
      }

      const result = await updatePartStock(data.part_id, newQuantity)
      if (result) {
        success("Sucesso", `${data.type === "entry" ? "Entrada" : "Saída"} registrada com sucesso!`)
        setIsStockEntryOpen(false)
      }
    } catch (error) {
      showError("Erro", "Erro ao registrar movimentação.")
    }
  }

  const handleViewDetails = (part: Part) => {
    setSelectedPart(part)
    setIsDetailsOpen(true)
  }

  const handleEditPart = (part: Part) => {
    setSelectedPart(part)
    setIsPartFormOpen(true)
  }

  const handleEditFromDetails = (part: Part) => {
    setIsDetailsOpen(false)
    setIsPartFormOpen(true)
  }

  const handleStockEntryForPart = (part: Part) => {
    setSelectedPart(part)
    setIsStockEntryOpen(true)
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
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">Gerencie o estoque de peças e componentes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsStockEntryOpen(true)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Entrada
          </Button>
          <Button onClick={() => setIsPartFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Peça
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Peças</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Peças</CardTitle>
          <CardDescription>{filteredParts.length} peça(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estoques</SelectItem>
                <SelectItem value="low">Estoque baixo</SelectItem>
                <SelectItem value="out">Sem estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peça</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedParts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhuma peça encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedParts.map((part) => {
                    const quantity = getNumericValue(part.quantity)
                    const minStock = getNumericValue(part.minimum_stock)
                    const costPrice = getNumericValue(part.cost_price)
                    const salePrice = getNumericValue(part.sale_price)

                    const isLowStock = quantity <= minStock && quantity > 0
                    const isOutOfStock = quantity === 0

                    return (
                      <TableRow key={part.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{part.name || "Nome não informado"}</p>
                            <p className="text-sm text-gray-500">{part.description || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm">{part.code || "N/A"}</code>
                        </TableCell>
                        <TableCell>{part.category || "Sem categoria"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                isOutOfStock ? "text-red-600" : isLowStock ? "text-yellow-600" : "text-green-600"
                              }`}
                            >
                              {quantity} {part.unit || "un"}
                            </span>
                            {isOutOfStock && (
                              <Badge variant="destructive" className="text-xs">
                                Sem estoque
                              </Badge>
                            )}
                            {isLowStock && !isOutOfStock && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                Baixo
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Mín: {minStock} {part.unit || "un"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(salePrice)}</p>
                            <p className="text-sm text-gray-500">Custo: {formatCurrency(costPrice)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(part)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditPart(part)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleStockEntryForPart(part)}>
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setPartToDelete(part)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
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

      <PartForm
        part={selectedPart}
        isOpen={isPartFormOpen}
        onClose={() => {
          setIsPartFormOpen(false)
          setSelectedPart(null)
        }}
        onSubmit={selectedPart ? handleUpdatePart : handleCreatePart}
      />

      <PartDetailsModal
        part={selectedPart}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedPart(null)
        }}
        onEdit={handleEditFromDetails}
      />

      <StockEntryForm
        isOpen={isStockEntryOpen}
        onClose={() => {
          setIsStockEntryOpen(false)
          setSelectedPart(null)
        }}
        onSubmit={handleStockEntry}
        preSelectedPartId={selectedPart?.id}
      />

      <AlertDialog open={!!partToDelete} onOpenChange={() => setPartToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta peça? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePart}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
