"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Package, AlertTriangle, Search, TrendingUp, MoreHorizontal, Eye, Edit } from "lucide-react"
import { useParts } from "@/hooks/use-parts"
import { usePagination } from "@/hooks/use-pagination"
import { PartDetailsModal } from "@/components/modals/part-details-modal"
import { PartForm } from "@/components/forms/part-form"
import { StockEntryForm } from "@/components/forms/stock-entry-form"

export default function InventoryPage() {
  const { parts, categories, loading, createPart, updatePart, createStockEntry } = useParts()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPart, setSelectedPart] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCreatePartModalOpen, setIsCreatePartModalOpen] = useState(false)
  const [isEditPartModalOpen, setIsEditPartModalOpen] = useState(false)
  const [isStockEntryModalOpen, setIsStockEntryModalOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStockStatus = (part: any) => {
    if (part.stockQuantity === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    } else if (part.stockQuantity <= part.minStockLevel) {
      return <Badge variant="outline">Baixo Estoque</Badge>
    } else {
      return <Badge>Em Estoque</Badge>
    }
  }

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || part.categoryId === selectedCategory

    return matchesSearch && matchesCategory
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
  } = usePagination({ data: filteredParts, itemsPerPage: 10 })

  const handleViewDetails = (part: any) => {
    setSelectedPart(part)
    setIsDetailsModalOpen(true)
  }

  const handleEditPart = (part: any) => {
    setSelectedPart(part)
    setIsEditPartModalOpen(true)
  }

  const handleCreatePart = async (data: any) => {
    const result = await createPart(data)
    if (result) {
      setIsCreatePartModalOpen(false)
    }
  }

  const handleUpdatePart = async (data: any) => {
    if (selectedPart) {
      const result = await updatePart(selectedPart.id, data)
      if (result) {
        setIsEditPartModalOpen(false)
        setSelectedPart(null)
      }
    }
  }

  const handleStockEntry = async (data: any) => {
    const result = await createStockEntry(data)
    if (result) {
      setIsStockEntryModalOpen(false)
    }
  }

  const lowStockParts = parts.filter((part) => part.stockQuantity <= part.minStockLevel)
  const totalValue = parts.reduce((sum, part) => sum + part.stockQuantity * part.costPrice, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
            <p className="text-muted-foreground">Gerencie o estoque de peças e componentes</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isStockEntryModalOpen} onOpenChange={setIsStockEntryModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Entrada
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Entrada de Estoque</DialogTitle>
                  <DialogDescription>Registre uma nova entrada de peças no estoque</DialogDescription>
                </DialogHeader>
                <StockEntryForm
                  parts={parts}
                  onSubmit={handleStockEntry}
                  onCancel={() => setIsStockEntryModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isCreatePartModalOpen} onOpenChange={setIsCreatePartModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Peça
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Peça</DialogTitle>
                  <DialogDescription>Cadastre uma nova peça no sistema</DialogDescription>
                </DialogHeader>
                <PartForm
                  categories={categories}
                  onSubmit={handleCreatePart}
                  onCancel={() => setIsCreatePartModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Peças</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parts.length}</div>
              <p className="text-xs text-muted-foreground">Itens cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Baixo Estoque</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockParts.length}</div>
              <p className="text-xs text-muted-foreground">Requer atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">Valor em estoque</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Categorias ativas</p>
            </CardContent>
          </Card>
        </div>

        {lowStockParts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Peças com Baixo Estoque
              </CardTitle>
              <CardDescription className="text-orange-700">
                {lowStockParts.length} peças precisam de reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockParts.slice(0, 5).map((part) => (
                  <div key={part.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="font-medium">{part.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {part.stockQuantity} / {part.minStockLevel} mín.
                      </span>
                      <Badge variant="outline">Baixo</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Peças</CardTitle>
            <CardDescription>
              Mostrando {startIndex} a {endIndex} de {totalItems} peças
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar peças..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
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
                      <TableHead>Peça</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Preço Custo</TableHead>
                      <TableHead>Preço Venda</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{part.name}</div>
                            {part.partNumber && <div className="text-sm text-muted-foreground">#{part.partNumber}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{categories.find((c) => c.id === part.categoryId)?.name || "-"}</TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-semibold">{part.stockQuantity}</div>
                            <div className="text-xs text-muted-foreground">mín: {part.minStockLevel}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(part.costPrice)}</TableCell>
                        <TableCell>{formatCurrency(part.salePrice)}</TableCell>
                        <TableCell>{getStockStatus(part)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(part)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditPart(part)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
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

        {/* Edit Part Modal */}
        <Dialog open={isEditPartModalOpen} onOpenChange={setIsEditPartModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Peça</DialogTitle>
              <DialogDescription>Edite os dados da peça selecionada</DialogDescription>
            </DialogHeader>
            {selectedPart && (
              <PartForm
                categories={categories}
                initialData={selectedPart}
                onSubmit={handleUpdatePart}
                onCancel={() => {
                  setIsEditPartModalOpen(false)
                  setSelectedPart(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Part Details Modal */}
        <PartDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedPart(null)
          }}
          part={selectedPart}
          category={selectedPart ? categories.find((c) => c.id === selectedPart.categoryId) : null}
        />
      </div>
    </DashboardLayout>
  )
}
