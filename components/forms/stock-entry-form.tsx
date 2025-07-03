"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParts } from "@/hooks/use-parts"

interface StockEntryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  preSelectedPartId?: string
}

const entryReasons = ["Compra", "Devolução", "Ajuste de inventário", "Transferência", "Outros"]
const exitReasons = ["Venda", "Uso em serviço", "Perda", "Devolução ao fornecedor", "Transferência", "Outros"]

export function StockEntryForm({ isOpen, onClose, onSubmit, preSelectedPartId }: StockEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { parts, loading: partsLoading } = useParts()

  const [formData, setFormData] = useState({
    part_id: preSelectedPartId || "",
    quantity: 1,
    type: "entry" as "entry" | "exit",
    reason: "",
    notes: "",
  })

  useEffect(() => {
    if (preSelectedPartId) {
      setFormData((prev) => ({ ...prev, part_id: preSelectedPartId }))
    }
  }, [preSelectedPartId])

  useEffect(() => {
    // Reset reason when type changes
    setFormData((prev) => ({ ...prev, reason: "" }))
  }, [formData.type])

  const selectedPart = parts.find((part) => part.id === formData.part_id)
  const availableReasons = formData.type === "entry" ? entryReasons : exitReasons

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      setFormData({
        part_id: "",
        quantity: 1,
        type: "entry",
        reason: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error submitting stock entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentação de Estoque</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Peça *</Label>
            <Select
              value={formData.part_id}
              onValueChange={(value) => handleInputChange("part_id", value)}
              disabled={partsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a peça" />
              </SelectTrigger>
              <SelectContent>
                {parts.map((part) => (
                  <SelectItem key={part.id} value={part.id}>
                    {part.name} - {part.code || part.partNumber} (Estoque: {part.quantity || part.stockQuantity || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPart && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm">
                <strong>Estoque atual:</strong> {selectedPart.quantity || selectedPart.stockQuantity || 0}{" "}
                {selectedPart.unit || "un"}
              </p>
              <p className="text-sm">
                <strong>Estoque mínimo:</strong> {selectedPart.minimum_stock || selectedPart.minStockLevel || 0}{" "}
                {selectedPart.unit || "un"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tipo de Movimentação *</Label>
            <Select value={formData.type} onValueChange={(value: "entry" | "exit") => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entrada</SelectItem>
                <SelectItem value="exit">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Motivo *</Label>
            <Select value={formData.reason} onValueChange={(value) => handleInputChange("reason", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {availableReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
