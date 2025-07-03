"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Part } from "@/domain/entities/part"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const partSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  code: z.string().min(1, "Código é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  quantity: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  minimum_stock: z.number().min(0, "Estoque mínimo deve ser maior ou igual a 0"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  cost_price: z.number().min(0, "Preço de custo deve ser maior ou igual a 0"),
  sale_price: z.number().min(0, "Preço de venda deve ser maior ou igual a 0"),
  supplier: z.string().optional(),
  location: z.string().optional(),
})

type PartFormData = z.infer<typeof partSchema>

interface PartFormProps {
  part?: Part | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PartFormData) => Promise<void>
}

const categories = [
  "Motor",
  "Transmissão",
  "Freios",
  "Suspensão",
  "Elétrica",
  "Carroceria",
  "Pneus",
  "Filtros",
  "Óleos",
  "Outros",
]

const units = ["UN", "PC", "KG", "L", "M", "M²", "M³", "CX", "PCT", "PAR"]

export function PartForm({ part, isOpen, onClose, onSubmit }: PartFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      category: "",
      quantity: 0,
      minimum_stock: 0,
      unit: "UN",
      cost_price: 0,
      sale_price: 0,
      supplier: "",
      location: "",
    },
  })

  const selectedCategory = watch("category")
  const selectedUnit = watch("unit")

  useEffect(() => {
    if (part) {
      reset({
        name: part.name,
        description: part.description || "",
        code: part.code,
        category: part.category,
        quantity: part.quantity,
        minimum_stock: part.minimum_stock,
        unit: part.unit,
        cost_price: part.cost_price,
        sale_price: part.sale_price,
        supplier: part.supplier || "",
        location: part.location || "",
      })
    } else {
      reset({
        name: "",
        description: "",
        code: "",
        category: "",
        quantity: 0,
        minimum_stock: 0,
        unit: "UN",
        cost_price: 0,
        sale_price: 0,
        supplier: "",
        location: "",
      })
    }
  }, [part, reset])

  const handleFormSubmit = async (data: PartFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast({
        title: "Sucesso",
        description: part ? "Peça atualizada com sucesso!" : "Peça criada com sucesso!",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a peça.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{part ? "Editar Peça" : "Nova Peça"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register("name")} placeholder="Nome da peça" />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input id="code" {...register("code")} placeholder="Código da peça" />
              {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} placeholder="Descrição da peça" rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={selectedCategory} onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Unidade *</Label>
              <Select value={selectedUnit} onValueChange={(value) => setValue("unit", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-sm text-red-600">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input id="quantity" type="number" min="0" step="1" {...register("quantity", { valueAsNumber: true })} />
              {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                step="1"
                {...register("minimum_stock", { valueAsNumber: true })}
              />
              {errors.minimum_stock && <p className="text-sm text-red-600">{errors.minimum_stock.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Preço de Custo *</Label>
              <Input
                id="cost_price"
                type="number"
                min="0"
                step="0.01"
                {...register("cost_price", { valueAsNumber: true })}
              />
              {errors.cost_price && <p className="text-sm text-red-600">{errors.cost_price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Preço de Venda *</Label>
              <Input
                id="sale_price"
                type="number"
                min="0"
                step="0.01"
                {...register("sale_price", { valueAsNumber: true })}
              />
              {errors.sale_price && <p className="text-sm text-red-600">{errors.sale_price.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input id="supplier" {...register("supplier")} placeholder="Nome do fornecedor" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" {...register("location")} placeholder="Ex: Prateleira A1" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : part ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
