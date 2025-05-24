"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PartFormProps {
  categories: any[]
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function PartForm({ categories, initialData, onSubmit, onCancel }: PartFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    partNumber: initialData?.partNumber || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || "",
    costPrice: initialData?.costPrice || "",
    salePrice: initialData?.salePrice || "",
    stockQuantity: initialData?.stockQuantity || "",
    minStockLevel: initialData?.minStockLevel || "",
    location: initialData?.location || "",
    supplier: initialData?.supplier || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      costPrice: Number.parseFloat(formData.costPrice) || 0,
      salePrice: Number.parseFloat(formData.salePrice) || 0,
      stockQuantity: Number.parseInt(formData.stockQuantity) || 0,
      minStockLevel: Number.parseInt(formData.minStockLevel) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Peça *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="partNumber">Código da Peça</Label>
          <Input
            id="partNumber"
            value={formData.partNumber}
            onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Categoria *</Label>
        <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="costPrice">Preço de Custo *</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salePrice">Preço de Venda *</Label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Quantidade em Estoque *</Label>
          <Input
            id="stockQuantity"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minStockLevel">Estoque Mínimo *</Label>
          <Input
            id="minStockLevel"
            type="number"
            value={formData.minStockLevel}
            onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initialData ? "Atualizar" : "Criar"} Peça</Button>
      </div>
    </form>
  )
}
