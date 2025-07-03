"use client"

import type { Part } from "@/domain/entities/part"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, AlertTriangle, MapPin, Calendar } from "lucide-react"

interface PartDetailsModalProps {
  part: Part | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (part: Part) => void
}

export function PartDetailsModal({ part, isOpen, onClose, onEdit }: PartDetailsModalProps) {
  if (!part) return null

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || isNaN(value)) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Não informado"
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      return dateObj.toLocaleDateString("pt-BR")
    } catch {
      return "Data inválida"
    }
  }

  const getNumericValue = (value: any): number => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 0
    }
    return Number(value)
  }

  const quantity = getNumericValue(part.quantity || part.stockQuantity)
  const minStock = getNumericValue(part.minimum_stock || part.minStockLevel)
  const costPrice = getNumericValue(part.cost_price || part.costPrice)
  const salePrice = getNumericValue(part.sale_price || part.salePrice)

  const isLowStock = quantity <= minStock && quantity > 0
  const isOutOfStock = quantity === 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {part.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Informações Básicas */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {isOutOfStock && <Badge variant="destructive">Sem estoque</Badge>}
              {isLowStock && !isOutOfStock && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Estoque baixo
                </Badge>
              )}
              {!isLowStock && !isOutOfStock && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Em estoque
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(part)}>
                  Editar
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-4 w-4" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Nome:</strong> {part.name}
                </p>
                <p>
                  <strong>Código:</strong> {part.code || part.partNumber || "N/A"}
                </p>
                <p>
                  <strong>Categoria:</strong> {part.category || "Sem categoria"}
                </p>
                <p>
                  <strong>Marca:</strong> {part.brand || "Não informado"}
                </p>
                {part.description && (
                  <p>
                    <strong>Descrição:</strong> {part.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Estoque */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-4 w-4" />
                  Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Quantidade atual:</strong>{" "}
                  <span
                    className={`font-medium ${
                      isOutOfStock ? "text-red-600" : isLowStock ? "text-yellow-600" : "text-green-600"
                    }`}
                  >
                    {quantity} {part.unit || "un"}
                  </span>
                </p>
                <p>
                  <strong>Estoque mínimo:</strong> {minStock} {part.unit || "un"}
                </p>
                <p>
                  <strong>Unidade:</strong> {part.unit || "un"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-4 w-4" />
                Preços
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium text-sm text-gray-600">Preço de Custo</p>
                <p className="text-lg font-bold">{formatCurrency(costPrice)}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-600">Preço de Venda</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(salePrice)}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-600">Margem</p>
                <p className="text-lg font-bold">
                  {costPrice > 0 ? `${(((salePrice - costPrice) / costPrice) * 100).toFixed(1)}%` : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Localização e Fornecedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-4 w-4" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{part.location || "Não informado"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-4 w-4" />
                  Fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{part.supplier || "Não informado"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm text-gray-600">Data de Criação</p>
                <p>{formatDate(part.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-600">Última Atualização</p>
                <p>{formatDate(part.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
