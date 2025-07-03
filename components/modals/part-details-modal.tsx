"use client"

import type { Part } from "@/domain/entities/part"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, Hash, AlertTriangle, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PartDetailsModalProps {
  part: Part | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (part: Part) => void
}

export function PartDetailsModal({ part, isOpen, onClose, onEdit }: PartDetailsModalProps) {
  if (!part) return null

  const isLowStock = part.quantity <= part.minimum_stock

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalhes da Peça
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com nome e status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{part.name}</h3>
              <p className="text-gray-600">{part.description}</p>
            </div>
            <div className="flex gap-2">
              {isLowStock && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Estoque Baixo
                </Badge>
              )}
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(part)}>
                  Editar
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hash className="h-4 w-4" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-gray-600">Código</p>
                  <p className="font-mono">{part.code}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-600">Categoria</p>
                  <p>{part.category}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-600">Localização</p>
                  <p>{part.location || "Não informada"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Estoque */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-4 w-4" />
                  Controle de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-gray-600">Quantidade Atual</p>
                  <p className={`text-2xl font-bold ${isLowStock ? "text-red-600" : "text-green-600"}`}>
                    {part.quantity}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-600">Estoque Mínimo</p>
                  <p>{part.minimum_stock}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-600">Unidade</p>
                  <p>{part.unit}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-4 w-4" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm text-gray-600">Preço de Custo</p>
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(part.cost_price)}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-600">Preço de Venda</p>
                <p className="text-lg font-semibold text-green-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(part.sale_price)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fornecedor */}
          {part.supplier && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fornecedor</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{part.supplier}</p>
              </CardContent>
            </Card>
          )}

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
                <p className="font-medium text-sm text-gray-600">Criado em</p>
                <p>{format(new Date(part.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-600">Última atualização</p>
                <p>{format(new Date(part.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
