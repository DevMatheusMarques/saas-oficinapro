"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, BarChart3, AlertTriangle } from "lucide-react"

interface PartDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  part: any
  category: any
}

export function PartDetailsModal({ isOpen, onClose, part, category }: PartDetailsModalProps) {
  if (!part) return null

  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) {
      return "R$ 0,00"
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStockStatus = () => {
    const quantity = part.stockQuantity || part.quantity || 0
    const minStock = part.minStockLevel || part.minimum_stock || 0

    if (quantity === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    } else if (quantity <= minStock) {
      return <Badge variant="outline">Baixo Estoque</Badge>
    } else {
      return <Badge>Em Estoque</Badge>
    }
  }

  const costPrice = part.costPrice || part.cost_price || 0
  const salePrice = part.salePrice || part.sale_price || 0
  const quantity = part.stockQuantity || part.quantity || 0
  const minStock = part.minStockLevel || part.minimum_stock || 0

  const profitMargin = costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {part.name}
          </DialogTitle>
          <DialogDescription>Detalhes completos da peça</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{part.name}</p>
                </div>
                {(part.partNumber || part.code) && (
                  <div>
                    <p className="text-xs text-muted-foreground">Código</p>
                    <p className="font-mono text-sm">{part.partNumber || part.code}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <p>{category?.name || part.category || "Sem categoria"}</p>
                </div>
                {part.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Descrição</p>
                    <p className="text-sm">{part.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  {getStockStatus()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantidade Atual</p>
                  <p className="text-2xl font-bold">{quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estoque Mínimo</p>
                  <p className="text-sm">{minStock}</p>
                </div>
                {part.location && (
                  <div>
                    <p className="text-xs text-muted-foreground">Localização</p>
                    <p className="text-sm">{part.location}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Preços e Margem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Preço de Custo</p>
                  <p className="text-lg font-semibold">{formatCurrency(costPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preço de Venda</p>
                  <p className="text-lg font-semibold">{formatCurrency(salePrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Margem de Lucro</p>
                  <p className="text-lg font-semibold">{profitMargin.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor em Estoque</p>
                  <p className="text-lg font-semibold">{formatCurrency(quantity * costPrice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {part.supplier && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Fornecedor</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{part.supplier}</p>
              </CardContent>
            </Card>
          )}

          {quantity <= minStock && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alerta de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  Esta peça está com estoque baixo. Considere fazer uma nova compra.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
