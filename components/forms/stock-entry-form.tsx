"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StockEntryFormProps {
  parts: any[]
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function StockEntryForm({ parts, onSubmit, onCancel }: StockEntryFormProps) {
  const [formData, setFormData] = useState({
    partId: "",
    quantity: "",
    unitCost: "",
    supplier: "",
    invoiceNumber: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      quantity: Number.parseInt(formData.quantity) || 0,
      unitCost: Number.parseFloat(formData.unitCost) || 0,
    })
  }

  const selectedPart = parts.find((p) => p.id === formData.partId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="partId">Peça *</Label>
        <Select value={formData.partId} onValueChange={(value) => setFormData({ ...formData, partId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma peça" />
          </SelectTrigger>
          <SelectContent>
            {parts.map((part) => (
              <SelectItem key={part.id} value={part.id}>
                {part.name} {part.partNumber && `(${part.partNumber})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPart && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Estoque atual:</strong> {selectedPart.stockQuantity} unidades
          </p>
          <p className="text-sm">
            <strong>Último preço de custo:</strong>{" "}
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedPart.costPrice)}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitCost">Custo Unitário *</Label>
          <Input
            id="unitCost"
            type="number"
            step="0.01"
            value={formData.unitCost}
            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Número da Nota</Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {formData.quantity && formData.unitCost && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            <strong>Total da entrada:</strong>{" "}
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              Number.parseInt(formData.quantity) * Number.parseFloat(formData.unitCost),
            )}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Registrar Entrada</Button>
      </div>
    </form>
  )
}
