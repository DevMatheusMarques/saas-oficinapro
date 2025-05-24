"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import type { Customer } from "@/domain/entities/customer"
import type { Motorcycle } from "@/domain/entities/motorcycle"
import type { CreateBudgetData } from "@/domain/entities/budget"

interface BudgetFormProps {
  customers: Customer[]
  motorcycles: Motorcycle[]
  initialData?: any
  onSubmit: (data: CreateBudgetData) => void
  onCancel: () => void
}

interface LaborItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface PartItem {
  partId?: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export function BudgetForm({ customers, motorcycles, initialData, onSubmit, onCancel }: BudgetFormProps) {
  const [customerId, setCustomerId] = useState(initialData?.customerId || "")
  const [motorcycleId, setMotorcycleId] = useState(initialData?.motorcycleId || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil ? initialData.validUntil.toISOString().split("T")[0] : "",
  )
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [laborItems, setLaborItems] = useState<LaborItem[]>([])
  const [partItems, setPartItems] = useState<PartItem[]>([])

  const customerMotorcycles = motorcycles.filter((m) => m.customerId === customerId)

  const addLaborItem = () => {
    setLaborItems([...laborItems, { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  const updateLaborItem = (index: number, field: keyof LaborItem, value: string | number) => {
    const updated = [...laborItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "quantity" || field === "unitPrice") {
      updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice
    }

    setLaborItems(updated)
  }

  const removeLaborItem = (index: number) => {
    setLaborItems(laborItems.filter((_, i) => i !== index))
  }

  const addPartItem = () => {
    setPartItems([...partItems, { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  const updatePartItem = (index: number, field: keyof PartItem, value: string | number) => {
    const updated = [...partItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "quantity" || field === "unitPrice") {
      updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice
    }

    setPartItems(updated)
  }

  const removePartItem = (index: number) => {
    setPartItems(partItems.filter((_, i) => i !== index))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const laborTotal = laborItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const partsTotal = partItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const grandTotal = laborTotal + partsTotal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId || !motorcycleId) {
      alert("Por favor, selecione um cliente e uma moto")
      return
    }

    if (laborItems.length === 0 && partItems.length === 0) {
      alert("Adicione pelo menos um item de mão de obra ou peça")
      return
    }

    const data: CreateBudgetData = {
      customerId,
      motorcycleId,
      description,
      validUntil: validUntil ? new Date(validUntil) : undefined,
      notes,
      laborItems: laborItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      partItems: partItems.map((item) => ({
        partId: item.partId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Cliente</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motorcycle">Moto</Label>
          <Select value={motorcycleId} onValueChange={setMotorcycleId} disabled={!customerId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma moto" />
            </SelectTrigger>
            <SelectContent>
              {customerMotorcycles.map((motorcycle) => (
                <SelectItem key={motorcycle.id} value={motorcycle.id}>
                  {motorcycle.brand} {motorcycle.model} ({motorcycle.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do serviço..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validUntil">Válido até</Label>
          <Input id="validUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
      </div>

      {/* Labor Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Mão de Obra</CardTitle>
            <Button type="button" onClick={addLaborItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {laborItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laborItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLaborItem(index, "description", e.target.value)}
                        placeholder="Descrição do serviço"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLaborItem(index, "quantity", Number.parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLaborItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLaborItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhum item de mão de obra adicionado</p>
          )}
        </CardContent>
      </Card>

      {/* Part Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Peças</CardTitle>
            <Button type="button" onClick={addPartItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {partItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => updatePartItem(index, "description", e.target.value)}
                        placeholder="Descrição da peça"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updatePartItem(index, "quantity", Number.parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updatePartItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePartItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhuma peça adicionada</p>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal Mão de Obra:</span>
              <span>{formatCurrency(laborTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal Peças:</span>
              <span>{formatCurrency(partsTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Geral:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações adicionais..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initialData ? "Atualizar" : "Criar"} Orçamento</Button>
      </div>
    </form>
  )
}
