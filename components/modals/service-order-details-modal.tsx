"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, User, Car, Wrench, Calendar, DollarSign } from "lucide-react"

interface ServiceOrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  serviceOrder: any
  customer: any
  motorcycle: any
}

export function ServiceOrderDetailsModal({
  isOpen,
  onClose,
  serviceOrder,
  customer,
  motorcycle,
}: ServiceOrderDetailsModalProps) {
  if (!serviceOrder) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline">Aberta</Badge>
      case "in_progress":
        return <Badge>Em Andamento</Badge>
      case "waiting_parts":
        return <Badge variant="outline">Aguardando Peças</Badge>
      case "completed":
        return <Badge>Concluída</Badge>
      case "delivered":
        return <Badge>Entregue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Ordem de Serviço #{serviceOrder.orderNumber}
          </DialogTitle>
          <DialogDescription>Detalhes completos da ordem de serviço</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(serviceOrder.status)}
            </div>
            <div className="text-sm text-muted-foreground">
              Criada em {serviceOrder.createdAt?.toLocaleDateString("pt-BR")}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{customer?.name || "Cliente não encontrado"}</p>
                  <p className="text-sm text-muted-foreground">{customer?.email}</p>
                  <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Motocicleta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">
                    {motorcycle ? `${motorcycle.brand} ${motorcycle.model}` : "Moto não encontrada"}
                  </p>
                  <p className="text-sm text-muted-foreground">Ano: {motorcycle?.year}</p>
                  <p className="text-sm text-muted-foreground">Placa: {motorcycle?.licensePlate}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Descrição do Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{serviceOrder.problemDescription || "Nenhuma descrição fornecida"}</p>
            </CardContent>
          </Card>

          {serviceOrder.serviceDescription && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Serviços Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{serviceOrder.serviceDescription}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p className="text-sm">
                    {serviceOrder.startDate ? serviceOrder.startDate.toLocaleDateString("pt-BR") : "Não iniciada"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Previsão</p>
                  <p className="text-sm">
                    {serviceOrder.estimatedCompletion
                      ? serviceOrder.estimatedCompletion.toLocaleDateString("pt-BR")
                      : "Não definida"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conclusão</p>
                  <p className="text-sm">
                    {serviceOrder.completionDate
                      ? serviceOrder.completionDate.toLocaleDateString("pt-BR")
                      : "Não concluída"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Mão de Obra</p>
                  <p className="text-sm font-medium">{formatCurrency(serviceOrder.laborCost || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peças</p>
                  <p className="text-sm font-medium">{formatCurrency(serviceOrder.partsCost || 0)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-bold">{formatCurrency(serviceOrder.totalCost || 0)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Estimado</p>
                  <p className="text-sm">{serviceOrder.estimatedHours || 0}h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trabalhado</p>
                  <p className="text-sm">{serviceOrder.actualHours || 0}h</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {serviceOrder.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{serviceOrder.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
