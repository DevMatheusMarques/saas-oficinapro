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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react"
import { useCustomers } from "@/hooks/use-customers"
import type { CreateCustomerData, UpdateCustomerData } from "@/domain/entities/customer"

export default function CustomersPage() {
  const { customers, loading, createCustomer, updateCustomer, deleteCustomer, searchCustomers } = useCustomers()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [formData, setFormData] = useState<CreateCustomerData>({
    name: "",
    email: "",
    phone: "",
    cpfCnpj: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  })

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  )

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const customer = await createCustomer(formData)
    if (customer) {
      setIsCreateDialogOpen(false)
      resetForm()
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return

    const updateData: UpdateCustomerData = {
      id: editingCustomer.id,
      ...formData,
    }

    const customer = await updateCustomer(updateData)
    if (customer) {
      setIsEditDialogOpen(false)
      setEditingCustomer(null)
      resetForm()
    }
  }

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      cpfCnpj: customer.cpfCnpj || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zipCode: customer.zipCode || "",
      notes: customer.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      await deleteCustomer(id)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      cpfCnpj: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    })
  }

  const formatPhone = (phone: string) => {
    if (!phone) return ""
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes e suas informações</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription>Adicione um novo cliente ao sistema</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                      <Input
                        id="cpfCnpj"
                        value={formData.cpfCnpj}
                        onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      />
                    </div>
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
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Cliente</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {customers.length} cliente{customers.length !== 1 ? "s" : ""} cadastrado
              {customers.length !== 1 ? "s" : ""}
            </CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{customer.name}</div>
                          {customer.notes && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">{customer.notes}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {formatPhone(customer.phone)}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.city || customer.state ? (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {[customer.city, customer.state].filter(Boolean).join(", ")}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.cpfCnpj ? (
                          <Badge variant="outline">{customer.cpfCnpj}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(customer.id)}>
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>Atualize as informações do cliente</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cpfCnpj">CPF/CNPJ</Label>
                    <Input
                      id="edit-cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Endereço</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">Cidade</Label>
                    <Input
                      id="edit-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-state">Estado</Label>
                    <Input
                      id="edit-state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-zipCode">CEP</Label>
                    <Input
                      id="edit-zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                  </div>
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
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
