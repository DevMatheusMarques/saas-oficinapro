"use client"
import type { ServiceOrder } from "@/domain/entities/service-order"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, User, Wrench, DollarSign, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Ordem de Serviço #{serviceOrder.id}
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
                  <strong>Nome:</strong> {serviceOrder.customer_name}
                </p>
                <p>
                  <strong>Email:</strong> {serviceOrder.customer_email}
                </p>
                <p>
                  <strong>Telefone:</strong> {serviceOrder.customer_phone}
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
                  <strong>Modelo:</strong> {serviceOrder.motorcycle_model}
                </p>
                <p>
                  <strong>Ano:</strong> {serviceOrder.motorcycle_year}
                </p>
                <p>
                  <strong>Placa:</strong> {serviceOrder.motorcycle_plate}
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
                <p>{format(new Date(serviceOrder.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
              {serviceOrder.scheduled_date && (
                <div>
                  <p className="font-medium text-sm text-gray-600">Data Agendada</p>
                  <p>{format(new Date(serviceOrder.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              )}
              {serviceOrder.completed_at && (
                <div>
                  <p className="font-medium text-sm text-gray-600">Data de Conclusão</p>
                  <p>{format(new Date(serviceOrder.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
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
              <p className="whitespace-pre-wrap">{serviceOrder.description}</p>
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
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(serviceOrder.total_amount)}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
