"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CreateAccountPayableData } from "@/domain/entities/payment"

interface AccountPayableFormProps {
  initialData?: any
  onSubmit: (data: CreateAccountPayableData) => void
  onCancel: () => void
}

export function AccountPayableForm({ initialData, onSubmit, onCancel }: AccountPayableFormProps) {
  const [supplierName, setSupplierName] = useState(initialData?.supplierName || "")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? initialData.dueDate.toISOString().split("T")[0] : "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [referenceNumber, setReferenceNumber] = useState(initialData?.referenceNumber || "")
  const [notes, setNotes] = useState(initialData?.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplierName || !amount || !dueDate) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const data: CreateAccountPayableData = {
      supplierName,
      amount: Number.parseFloat(amount),
      dueDate: new Date(dueDate),
      description: description || undefined,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="supplierName">Fornecedor *</Label>
        <Input
          id="supplierName"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="Nome do fornecedor"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Data de Vencimento *</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenceNumber">Número de Referência</Label>
        <Input
          id="referenceNumber"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="Número da nota fiscal, pedido, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição da conta..."
        />
      </div>

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
        <Button type="submit">{initialData ? "Atualizar" : "Criar"} Conta</Button>
      </div>
    </form>
  )
}
