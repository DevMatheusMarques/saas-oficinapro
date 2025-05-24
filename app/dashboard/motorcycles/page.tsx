"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Car, Calendar } from "lucide-react"
import { useMotorcycles } from "@/hooks/use-motorcycles"
import { useCustomers } from "@/hooks/use-customers"
import type { CreateMotorcycleData, UpdateMotorcycleData } from "@/domain/entities/motorcycle"

export default function MotorcyclesPage() {
  const { motorcycles, loading, createMotorcycle, updateMotorcycle, deleteMotorcycle } = useMotorcycles()
  const { customers } = useCustomers()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMotorcycle, setEditingMotorcycle] = useState<any>(null)
  const [formData, setFormData] = useState<CreateMotorcycleData>({
    customerId: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    licensePlate: "",
    chassisNumber: "",
    engineNumber: "",
    mileage: 0,
    notes: "",
  })

  const filteredMotorcycles = motorcycles.filter(
    (motorcycle) =>
      motorcycle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorcycle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorcycle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const motorcycle = await createMotorcycle(formData)
    if (motorcycle) {
      setIsCreateDialogOpen(false)
      resetForm()
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMotorcycle) return

    const updateData: UpdateMotorcycleData = {
      id: editingMotorcycle.id,
      ...formData,
    }

    const motorcycle = await updateMotorcycle(updateData)
    if (motorcycle) {
      setIsEditDialogOpen(false)
      setEditingMotorcycle(null)
      resetForm()
    }
  }

  const handleEdit = (motorcycle: any) => {
    setEditingMotorcycle(motorcycle)
    setFormData({
      customerId: motorcycle.customerId,
      brand: motorcycle.brand,
      model: motorcycle.model,
      year: motorcycle.year || new Date().getFullYear(),
      color: motorcycle.color || "",
      licensePlate: motorcycle.licensePlate || "",
      chassisNumber: motorcycle.chassisNumber || "",
      engineNumber: motorcycle.engineNumber || "",
      mileage: motorcycle.mileage || 0,
      notes: motorcycle.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta moto?")) {
      await deleteMotorcycle(id)
    }
  }

  const resetForm = () => {
    setFormData({
      customerId: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      licensePlate: "",
      chassisNumber: "",
      engineNumber: "",
      mileage: 0,
      notes: "",
    })
  }

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false)
    setEditingMotorcycle(null)
    resetForm()
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer?.name || "Cliente não encontrado"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Motocicletas</h1>
            <p className="text-muted-foreground">Gerencie as motocicletas dos seus clientes</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Moto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Motocicletas</CardTitle>
            <CardDescription>
              {motorcycles.length} motocicleta{motorcycles.length !== 1 ? "s" : ""} cadastrada
              {motorcycles.length !== 1 ? "s" : ""}
            </CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar motos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Quilometragem</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMotorcycles.map((motorcycle) => (
                    <TableRow key={motorcycle.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-semibold">
                              {motorcycle.brand} {motorcycle.model}
                            </div>
                            {motorcycle.color && (
                              <div className="text-sm text-muted-foreground">{motorcycle.color}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCustomerName(motorcycle.customerId)}</TableCell>
                      <TableCell>
                        {motorcycle.licensePlate ? (
                          <Badge variant="outline">{motorcycle.licensePlate}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {motorcycle.year ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {motorcycle.year}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{motorcycle.mileage ? `${motorcycle.mileage.toLocaleString()} km` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(motorcycle)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(motorcycle.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nova Motocicleta</DialogTitle>
              <DialogDescription>Adicione uma nova motocicleta ao sistema</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Cliente *</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  >
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
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Ano</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({
                          ...formData,
                          year: value === "" ? undefined : Number.parseInt(value) || new Date().getFullYear(),
                        })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Quilometragem</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({
                          ...formData,
                          mileage: value === "" ? 0 : Number.parseInt(value) || 0,
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">Placa</Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chassisNumber">Chassi</Label>
                    <Input
                      id="chassisNumber"
                      value={formData.chassisNumber}
                      onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineNumber">Número do Motor</Label>
                  <Input
                    id="engineNumber"
                    value={formData.engineNumber}
                    onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCreateDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Moto</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Motocicleta</DialogTitle>
              <DialogDescription>Atualize as informações da motocicleta</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customerId">Cliente *</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  >
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
                    <Label htmlFor="edit-brand">Marca *</Label>
                    <Input
                      id="edit-brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-model">Modelo *</Label>
                    <Input
                      id="edit-model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-year">Ano</Label>
                    <Input
                      id="edit-year"
                      type="number"
                      value={formData.year || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({
                          ...formData,
                          year: value === "" ? undefined : Number.parseInt(value) || new Date().getFullYear(),
                        })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-color">Cor</Label>
                    <Input
                      id="edit-color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-mileage">Quilometragem</Label>
                    <Input
                      id="edit-mileage"
                      type="number"
                      value={formData.mileage || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({
                          ...formData,
                          mileage: value === "" ? 0 : Number.parseInt(value) || 0,
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-licensePlate">Placa</Label>
                    <Input
                      id="edit-licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-chassisNumber">Chassi</Label>
                    <Input
                      id="edit-chassisNumber"
                      value={formData.chassisNumber}
                      onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-engineNumber">Número do Motor</Label>
                  <Input
                    id="edit-engineNumber"
                    value={formData.engineNumber}
                    onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Observações</Label>
                  <Textarea
                    id="edit-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleEditDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
