"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react"
import { usePayments } from "@/hooks/use-payments"
import { useCustomers } from "@/hooks/use-customers"
import { usePagination } from "@/hooks/use-pagination"
import { PaymentForm } from "@/components/forms/payment-form"
import { AccountPayableForm } from "@/components/forms/account-payable-form"

export default function FinancialPage() {
  const {
    payments,
    accountsPayable,
    loading,
    createPayment,
    updatePayment,
    deletePayment,
    createAccountPayable,
    updateAccountPayable,
    deleteAccountPayable,
    payAccountPayable,
  } = usePayments()
  const { customers } = useCustomers()
  const [searchTerm, setSearchTerm] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isAccountPayableModalOpen, setIsAccountPayableModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [selectedAccountPayable, setSelectedAccountPayable] = useState<any>(null)
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false)
  const [isEditAccountPayableModalOpen, setIsEditAccountPayableModalOpen] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case "cash":
        return <Badge variant="outline">Dinheiro</Badge>
      case "card":
        return <Badge>Cartão</Badge>
      case "pix":
        return <Badge>PIX</Badge>
      case "bank_transfer":
        return <Badge variant="outline">Transferência</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>
      case "paid":
        return <Badge>Pago</Badge>
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const customer = customers.find((c) => c.id === payment.customerId)
    return (
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const filteredAccountsPayable = accountsPayable.filter(
    (account) =>
      account.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const {
    currentPage: paymentsCurrentPage,
    totalPages: paymentsTotalPages,
    paginatedData: paginatedPayments,
    goToPage: goToPaymentsPage,
    goToNextPage: goToPaymentsNextPage,
    goToPreviousPage: goToPaymentsPreviousPage,
    hasNextPage: paymentsHasNextPage,
    hasPreviousPage: paymentsHasPreviousPage,
    startIndex: paymentsStartIndex,
    endIndex: paymentsEndIndex,
    totalItems: paymentsTotalItems,
  } = usePagination({ data: filteredPayments, itemsPerPage: 10 })

  const {
    currentPage: accountsCurrentPage,
    totalPages: accountsTotalPages,
    paginatedData: paginatedAccountsPayable,
    goToPage: goToAccountsPage,
    goToNextPage: goToAccountsNextPage,
    goToPreviousPage: goToAccountsPreviousPage,
    hasNextPage: accountsHasNextPage,
    hasPreviousPage: accountsHasPreviousPage,
    startIndex: accountsStartIndex,
    endIndex: accountsEndIndex,
    totalItems: accountsTotalItems,
  } = usePagination({ data: filteredAccountsPayable, itemsPerPage: 10 })

  const handleCreatePayment = async (data: any) => {
    const result = await createPayment(data)
    if (result) {
      setIsPaymentModalOpen(false)
    }
  }

  const handleCreateAccountPayable = async (data: any) => {
    const result = await createAccountPayable(data)
    if (result) {
      setIsAccountPayableModalOpen(false)
    }
  }

  const handleUpdatePayment = async (data: any) => {
    if (selectedPayment) {
      const result = await updatePayment(selectedPayment.id, data)
      if (result) {
        setIsEditPaymentModalOpen(false)
        setSelectedPayment(null)
      }
    }
  }

  const handleUpdateAccountPayable = async (data: any) => {
    if (selectedAccountPayable) {
      const result = await updateAccountPayable(selectedAccountPayable.id, data)
      if (result) {
        setIsEditAccountPayableModalOpen(false)
        setSelectedAccountPayable(null)
      }
    }
  }

  const handleDeletePayment = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este pagamento?")) {
      await deletePayment(id)
    }
  }

  const handleDeleteAccountPayable = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta a pagar?")) {
      await deleteAccountPayable(id)
    }
  }

  const handlePayAccountPayable = async (id: string) => {
    if (confirm("Tem certeza que deseja marcar esta conta como paga?")) {
      await payAccountPayable(id)
    }
  }

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalPayable = accountsPayable.filter((ap) => ap.status === "pending").reduce((sum, p) => sum + p.amount, 0)
  const overduePayments = accountsPayable.filter((p) => p.status === "overdue").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground">Controle de pagamentos e contas a pagar</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isAccountPayableModalOpen} onOpenChange={setIsAccountPayableModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Conta a Pagar</DialogTitle>
                  <DialogDescription>Registre uma nova conta a pagar</DialogDescription>
                </DialogHeader>
                <AccountPayableForm
                  onSubmit={handleCreateAccountPayable}
                  onCancel={() => setIsAccountPayableModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Pagamento</DialogTitle>
                  <DialogDescription>Registre um novo pagamento recebido</DialogDescription>
                </DialogHeader>
                <PaymentForm
                  customers={customers}
                  onSubmit={handleCreatePayment}
                  onCancel={() => setIsPaymentModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recebimentos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalReceived)}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPayable)}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalReceived - totalPayable)}</div>
              <p className="text-xs text-muted-foreground">Resultado do mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overduePayments}</div>
              <p className="text-xs text-muted-foreground">Contas em atraso</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Recebimentos</TabsTrigger>
            <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recebimentos</CardTitle>
                <CardDescription>
                  Mostrando {paymentsStartIndex} a {paymentsEndIndex} de {paymentsTotalItems} pagamentos
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar pagamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
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
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPayments.map((payment) => {
                          const customer = customers.find((c) => c.id === payment.customerId)

                          return (
                            <TableRow key={payment.id}>
                              <TableCell className="font-medium">
                                {customer?.name || "Cliente não encontrado"}
                              </TableCell>
                              <TableCell>{formatCurrency(payment.amount)}</TableCell>
                              <TableCell>{getPaymentTypeBadge(payment.paymentType)}</TableCell>
                              <TableCell>{payment.paymentDate.toLocaleDateString("pt-BR")}</TableCell>
                              <TableCell>{payment.description || "-"}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Ver Detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedPayment(payment)
                                        setIsEditPaymentModalOpen(true)
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeletePayment(payment.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>

                    {paymentsTotalPages > 1 && (
                      <div className="mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={goToPaymentsPreviousPage}
                                className={
                                  !paymentsHasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                            {Array.from({ length: paymentsTotalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => goToPaymentsPage(page)}
                                  isActive={paymentsCurrentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                onClick={goToPaymentsNextPage}
                                className={!paymentsHasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payables" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contas a Pagar</CardTitle>
                <CardDescription>
                  Mostrando {accountsStartIndex} a {accountsEndIndex} de {accountsTotalItems} contas
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar contas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
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
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAccountsPayable.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.supplierName}</TableCell>
                            <TableCell>{formatCurrency(account.amount)}</TableCell>
                            <TableCell>{account.dueDate.toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>{getStatusBadge(account.status)}</TableCell>
                            <TableCell>{account.description || "-"}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAccountPayable(account)
                                      setIsEditAccountPayableModalOpen(true)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  {account.status === "pending" && (
                                    <DropdownMenuItem onClick={() => handlePayAccountPayable(account.id)}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Marcar como Pago
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteAccountPayable(account.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {accountsTotalPages > 1 && (
                      <div className="mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={goToAccountsPreviousPage}
                                className={
                                  !accountsHasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                            {Array.from({ length: accountsTotalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => goToAccountsPage(page)}
                                  isActive={accountsCurrentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                onClick={goToAccountsNextPage}
                                className={!accountsHasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Payment Modal */}
        <Dialog open={isEditPaymentModalOpen} onOpenChange={setIsEditPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Pagamento</DialogTitle>
              <DialogDescription>Edite os dados do pagamento selecionado</DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <PaymentForm
                customers={customers}
                initialData={selectedPayment}
                onSubmit={handleUpdatePayment}
                onCancel={() => {
                  setIsEditPaymentModalOpen(false)
                  setSelectedPayment(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Account Payable Modal */}
        <Dialog open={isEditAccountPayableModalOpen} onOpenChange={setIsEditAccountPayableModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Conta a Pagar</DialogTitle>
              <DialogDescription>Edite os dados da conta a pagar selecionada</DialogDescription>
            </DialogHeader>
            {selectedAccountPayable && (
              <AccountPayableForm
                initialData={selectedAccountPayable}
                onSubmit={handleUpdateAccountPayable}
                onCancel={() => {
                  setIsEditAccountPayableModalOpen(false)
                  setSelectedAccountPayable(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
