"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Clock, CheckCircle, XCircle, User, Car, Calendar } from "lucide-react"
import type { Budget } from "@/domain/entities/budget"
import type { Customer } from "@/domain/entities/customer"
import type { Motorcycle } from "@/domain/entities/motorcycle"

interface BudgetDetailsModalProps {
  budget: Budget | null
  customer?: Customer
  motorcycle?: Motorcycle
  isOpen: boolean
  onClose: () => void
}

export function BudgetDetailsModal({ budget, customer, motorcycle, isOpen, onClose }: BudgetDetailsModalProps) {
  if (!budget) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline">
            <FileText className="h-3 w-3 mr-1" />
            Rascunho
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case "approved":
        return (
          <Badge>
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeitado
          </Badge>
        )
      case "completed":
        return (
          <Badge>
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes do Orçamento - {budget.budgetNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{customer?.name || "Cliente não encontrado"}</p>
                {customer && (
                  <div className="text-sm text-muted-foreground mt-1">
                    <p>{customer.email}</p>
                    <p>{customer.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Motocicleta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {motorcycle ? (
                  <div>
                    <p className="font-semibold">
                      {motorcycle.brand} {motorcycle.model}
                    </p>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Ano: {motorcycle.year}</p>
                      <p>Placa: {motorcycle.licensePlate}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Moto não encontrada</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(budget.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="font-medium">{budget.createdAt.toLocaleDateString("pt-BR")}</p>
                  </div>
                  {budget.validUntil && (
                    <div>
                      <p className="text-sm text-muted-foreground">Válido até</p>
                      <p className="font-medium">{budget.validUntil.toLocaleDateString("pt-BR")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {budget.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{budget.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal Mão de Obra:</span>
                  <span className="font-medium">{formatCurrency(budget.laborTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal Peças:</span>
                  <span className="font-medium">{formatCurrency(budget.partsTotal)}</span>
                </div>
                {budget.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(budget.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Geral:</span>
                  <span>{formatCurrency(budget.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {budget.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{budget.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
