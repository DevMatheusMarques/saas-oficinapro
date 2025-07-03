"use client"

import type { ServiceOrder } from "@/domain/entities/service-order"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, Wrench, DollarSign, FileText } from "lucide-react"

interface ServiceOrderDetailsModalProps {
  serviceOrder: ServiceOrder | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (serviceOrder: ServiceOrder) => void
}

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

export function ServiceOrderDetailsModal({ serviceOrder, isOpen, onClose, onEdit }: ServiceOrderDetailsModalProps) {
  if (!serviceOrder) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Ordem de Serviço #{serviceOrder.orderNumber || serviceOrder.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Informações Básicas */}
          <div className="flex items-center justify-between">
            <Badge className={statusColors[serviceOrder.status]}>{statusLabels[serviceOrder.status]}</Badge>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(serviceOrder)}>
                  Editar
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>ID:</strong> {serviceOrder.customerId}
                </p>
              </CardContent>
            </Card>

            {/* Informações da Moto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-4 w-4" />
                  Motocicleta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>ID:</strong> {serviceOrder.motorcycleId}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium text-sm text-gray-600">Data de Criação</p>
                <p>{formatDate(serviceOrder.createdAt)}</p>
              </div>
              {serviceOrder.startDate && (
                <div>
                  <p className="font-medium text-sm text-gray-600">Data de Início</p>
                  <p>{formatDate(serviceOrder.startDate)}</p>
                </div>
              )}
              {serviceOrder.estimatedCompletion && (
                <div>
                  <p className="font-medium text-sm text-gray-600">Previsão de Conclusão</p>
                  <p>{formatDate(serviceOrder.estimatedCompletion)}</p>
                </div>
              )}
              {serviceOrder.completionDate && (
                <div>
                  <p className="font-medium text-sm text-gray-600">Data de Conclusão</p>
                  <p>{formatDate(serviceOrder.completionDate)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descrição do Serviço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4" />
                Descrição do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{serviceOrder.description || "Nenhuma descrição fornecida"}</p>
            </CardContent>
          </Card>

          {/* Observações */}
          {serviceOrder.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-4 w-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{serviceOrder.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Valor Total */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-4 w-4" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(serviceOrder.totalAmount)}</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
