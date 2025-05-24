import type { Payment, CreatePaymentData, AccountPayable, CreateAccountPayableData } from "../entities/payment"

export interface PaymentRepository {
  // Payments
  findAllPayments(): Promise<Payment[]>
  findPaymentById(id: string): Promise<Payment | null>
  findPaymentsByCustomer(customerId: string): Promise<Payment[]>
  createPayment(data: CreatePaymentData): Promise<Payment>
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment>
  deletePayment(id: string): Promise<void>

  // Accounts Payable
  findAllAccountsPayable(): Promise<AccountPayable[]>
  findAccountPayableById(id: string): Promise<AccountPayable | null>
  findAccountsPayableByStatus(status: AccountPayable["status"]): Promise<AccountPayable[]>
  createAccountPayable(data: CreateAccountPayableData): Promise<AccountPayable>
  updateAccountPayable(id: string, data: Partial<AccountPayable>): Promise<AccountPayable>
  deleteAccountPayable(id: string): Promise<void>
}
