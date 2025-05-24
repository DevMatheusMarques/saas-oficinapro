"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Customer } from "@/domain/entities/customer"
import type { CreatePaymentData } from "@/domain/entities/payment"

interface PaymentFormProps {
  customers: Customer[]
  initialData?: any
  onSubmit: (data: CreatePaymentData) => void
  onCancel: () => void
}

export function PaymentForm({ customers, initialData, onSubmit, onCancel }: PaymentFormProps) {
  const [customerId, setCustomerId] = useState(initialData?.customerId || "")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [paymentType, setPaymentType] = useState(initialData?.paymentType || "")
  const [paymentDate, setPaymentDate] = useState(
    initialData?.paymentDate
      ? initialData.paymentDate.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  )
  const [description, setDescription] = useState(initialData?.description || "")
  const [referenceNumber, setReferenceNumber] = useState(initialData?.referenceNumber || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId || !amount || !paymentType || !paymentDate) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const data: CreatePaymentData = {
      customerId,
      amount: Number.parseFloat(amount),
      paymentType: paymentType as any,
      paymentDate: new Date(paymentDate),
      description: description || undefined,
      referenceNumber: referenceNumber || undefined,
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer">Cliente *</Label>
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
          <Label htmlFor="paymentType">Tipo de Pagamento *</Label>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Dinheiro</SelectItem>
              <SelectItem value="card">Cartão</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="bank_transfer">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentDate">Data do Pagamento *</Label>
        <Input
          id="paymentDate"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenceNumber">Número de Referência</Label>
        <Input
          id="referenceNumber"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="Número do comprovante, nota fiscal, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do pagamento..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initialData ? "Atualizar" : "Criar"} Pagamento</Button>
      </div>
    </form>
  )
}
