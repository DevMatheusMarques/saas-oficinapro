import type { Payment, CreatePaymentData, AccountPayable, CreateAccountPayableData } from "../entities/payment"
import type { PaymentRepository } from "../repositories/payment-repository"

export class PaymentUseCases {
  constructor(private paymentRepository: PaymentRepository) {}

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.findAllPayments()
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    if (!id) {
      throw new Error("Payment ID is required")
    }
    return this.paymentRepository.findPaymentById(id)
  }

  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    if (!customerId) {
      throw new Error("Customer ID is required")
    }
    return this.paymentRepository.findPaymentsByCustomer(customerId)
  }

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    if (!data.customerId) {
      throw new Error("Customer ID is required")
    }

    if (data.amount <= 0) {
      throw new Error("Payment amount must be greater than 0")
    }

    return this.paymentRepository.createPayment(data)
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    if (!id) {
      throw new Error("Payment ID is required")
    }

    const payment = await this.paymentRepository.findPaymentById(id)
    if (!payment) {
      throw new Error("Payment not found")
    }

    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error("Payment amount must be greater than 0")
    }

    return this.paymentRepository.updatePayment(id, data)
  }

  async deletePayment(id: string): Promise<void> {
    if (!id) {
      throw new Error("Payment ID is required")
    }

    const payment = await this.paymentRepository.findPaymentById(id)
    if (!payment) {
      throw new Error("Payment not found")
    }

    return this.paymentRepository.deletePayment(id)
  }

  // Accounts Payable
  async getAllAccountsPayable(): Promise<AccountPayable[]> {
    return this.paymentRepository.findAllAccountsPayable()
  }

  async getAccountPayableById(id: string): Promise<AccountPayable | null> {
    if (!id) {
      throw new Error("Account Payable ID is required")
    }
    return this.paymentRepository.findAccountPayableById(id)
  }

  async getAccountsPayableByStatus(status: AccountPayable["status"]): Promise<AccountPayable[]> {
    return this.paymentRepository.findAccountsPayableByStatus(status)
  }

  async createAccountPayable(data: CreateAccountPayableData): Promise<AccountPayable> {
    if (!data.supplierName.trim()) {
      throw new Error("Supplier name is required")
    }

    if (data.amount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    return this.paymentRepository.createAccountPayable(data)
  }

  async updateAccountPayable(id: string, data: Partial<AccountPayable>): Promise<AccountPayable> {
    if (!id) {
      throw new Error("Account Payable ID is required")
    }

    const accountPayable = await this.paymentRepository.findAccountPayableById(id)
    if (!accountPayable) {
      throw new Error("Account Payable not found")
    }

    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    return this.paymentRepository.updateAccountPayable(id, data)
  }

  async deleteAccountPayable(id: string): Promise<void> {
    if (!id) {
      throw new Error("Account Payable ID is required")
    }

    const accountPayable = await this.paymentRepository.findAccountPayableById(id)
    if (!accountPayable) {
      throw new Error("Account Payable not found")
    }

    return this.paymentRepository.deleteAccountPayable(id)
  }

  async payAccountPayable(id: string, paymentDate: Date): Promise<AccountPayable> {
    if (!id) {
      throw new Error("Account Payable ID is required")
    }

    const accountPayable = await this.paymentRepository.findAccountPayableById(id)
    if (!accountPayable) {
      throw new Error("Account Payable not found")
    }

    if (accountPayable.status === "paid") {
      throw new Error("Account Payable is already paid")
    }

    return this.paymentRepository.updateAccountPayable(id, {
      status: "paid",
      paymentDate,
    })
  }
}
