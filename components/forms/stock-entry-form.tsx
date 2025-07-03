"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useParts } from "@/hooks/use-parts"

const stockEntrySchema = z.object({
  part_id: z.string().min(1, "Peça é obrigatória"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  type: z.enum(["entry", "exit"], { required_error: "Tipo é obrigatório" }),
  reason: z.string().min(1, "Motivo é obrigatório"),
  notes: z.string().optional(),
})

type StockEntryFormData = z.infer<typeof stockEntrySchema>

interface StockEntryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StockEntryFormData) => Promise<void>
  preSelectedPartId?: string
}

const entryReasons = ["Compra", "Devolução", "Ajuste de inventário", "Transferência", "Outros"]

const exitReasons = ["Venda", "Uso em serviço", "Perda", "Devolução ao fornecedor", "Transferência", "Outros"]

export function StockEntryForm({ isOpen, onClose, onSubmit, preSelectedPartId }: StockEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { parts, loading: partsLoading } = useParts()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StockEntryFormData>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      part_id: preSelectedPartId || "",
      quantity: 1,
      type: "entry",
      reason: "",
      notes: "",
    },
  })

  const selectedPartId = watch("part_id")
  const selectedType = watch("type")
  const selectedReason = watch("reason")

  const selectedPart = parts.find((part) => part.id === selectedPartId)
  const availableReasons = selectedType === "entry" ? entryReasons : exitReasons

  useEffect(() => {
    if (preSelectedPartId) {
      setValue("part_id", preSelectedPartId)
    }
  }, [preSelectedPartId, setValue])

  useEffect(() => {
    // Reset reason when type changes
    setValue("reason", "")
  }, [selectedType, setValue])

  const handleFormSubmit = async (data: StockEntryFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast({
        title: "Sucesso",
        description: `${data.type === "entry" ? "Entrada" : "Saída"} de estoque registrada com sucesso!`,
      })
      reset()
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar a movimentação.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentação de Estoque</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Peça *</Label>
            <Select
              value={selectedPartId}
              onValueChange={(value) => setValue("part_id", value)}
              disabled={partsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a peça" />
              </SelectTrigger>
              <SelectContent>
                {parts.map((part) => (
                  <SelectItem key={part.id} value={part.id}>
                    {part.name} - {part.code} (Estoque: {part.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.part_id && <p className="text-sm text-red-600">{errors.part_id.message}</p>}
          </div>

          {selectedPart && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm">
                <strong>Estoque atual:</strong> {selectedPart.quantity} {selectedPart.unit}
              </p>
              <p className="text-sm">
                <strong>Estoque mínimo:</strong> {selectedPart.minimum_stock} {selectedPart.unit}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tipo de Movimentação *</Label>
            <Select value={selectedType} onValueChange={(value: "entry" | "exit") => setValue("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entrada</SelectItem>
                <SelectItem value="exit">Saída</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input id="quantity" type="number" min="1" step="1" {...register("quantity", { valueAsNumber: true })} />
            {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Motivo *</Label>
            <Select value={selectedReason} onValueChange={(value) => setValue("reason", value)}>
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
            {errors.reason && <p className="text-sm text-red-600">{errors.reason.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Observações adicionais..." rows={3} />
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
