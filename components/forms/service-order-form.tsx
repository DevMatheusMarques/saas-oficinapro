"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Customer } from "@/domain/entities/customer"
import type { Motorcycle } from "@/domain/entities/motorcycle"
import type { CreateServiceOrderData } from "@/domain/entities/service-order"

interface ServiceOrderFormProps {
  customers: Customer[]
  motorcycles: Motorcycle[]
  initialData?: any
  onSubmit: (data: CreateServiceOrderData) => void
  onCancel: () => void
}

export function ServiceOrderForm({ customers, motorcycles, initialData, onSubmit, onCancel }: ServiceOrderFormProps) {
  const [customerId, setCustomerId] = useState(initialData?.customerId || "")
  const [motorcycleId, setMotorcycleId] = useState(initialData?.motorcycleId || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? initialData.startDate.toISOString().split("T")[0] : "",
  )
  const [estimatedCompletion, setEstimatedCompletion] = useState(
    initialData?.estimatedCompletion ? initialData.estimatedCompletion.toISOString().split("T")[0] : "",
  )
  const [mechanicId, setMechanicId] = useState(initialData?.mechanicId || "")
  const [notes, setNotes] = useState(initialData?.notes || "")

  const customerMotorcycles = motorcycles.filter((m) => m.customerId === customerId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId || !motorcycleId) {
      alert("Por favor, selecione um cliente e uma moto")
      return
    }

    const data: CreateServiceOrderData = {
      customerId,
      motorcycleId,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : undefined,
      mechanicId: mechanicId || undefined,
      notes,
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="description">Descrição do Serviço</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o serviço a ser realizado..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Início</Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedCompletion">Previsão de Conclusão</Label>
          <Input
            id="estimatedCompletion"
            type="date"
            value={estimatedCompletion}
            onChange={(e) => setEstimatedCompletion(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mechanicId">Mecânico Responsável</Label>
        <Input
          id="mechanicId"
          value={mechanicId}
          onChange={(e) => setMechanicId(e.target.value)}
          placeholder="Nome do mecânico"
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
        <Button type="submit">{initialData ? "Atualizar" : "Criar"} OS</Button>
      </div>
    </form>
  )
}
