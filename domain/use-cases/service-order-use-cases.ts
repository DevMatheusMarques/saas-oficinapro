import type { ServiceOrder, CreateServiceOrderData } from "../entities/service-order"
import type { ServiceOrderRepository } from "../repositories/service-order-repository"

export class ServiceOrderUseCases {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async getAllServiceOrders(): Promise<ServiceOrder[]> {
    return this.serviceOrderRepository.findAll()
  }

  async getServiceOrderById(id: string): Promise<ServiceOrder | null> {
    if (!id) {
      throw new Error("Service Order ID is required")
    }
    return this.serviceOrderRepository.findById(id)
  }

  async getServiceOrdersByCustomer(customerId: string): Promise<ServiceOrder[]> {
    if (!customerId) {
      throw new Error("Customer ID is required")
    }
    return this.serviceOrderRepository.findByCustomerId(customerId)
  }

  async getServiceOrdersByStatus(status: ServiceOrder["status"]): Promise<ServiceOrder[]> {
    return this.serviceOrderRepository.findByStatus(status)
  }

  async createServiceOrder(data: CreateServiceOrderData): Promise<ServiceOrder> {
    if (!data.customerId) {
      throw new Error("Customer ID is required")
    }

    if (!data.motorcycleId) {
      throw new Error("Motorcycle ID is required")
    }

    return this.serviceOrderRepository.create(data)
  }

  async updateServiceOrder(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder> {
    if (!id) {
      throw new Error("Service Order ID is required")
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id)
    if (!serviceOrder) {
      throw new Error("Service Order not found")
    }

    return this.serviceOrderRepository.update(id, data)
  }

  async deleteServiceOrder(id: string): Promise<void> {
    if (!id) {
      throw new Error("Service Order ID is required")
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id)
    if (!serviceOrder) {
      throw new Error("Service Order not found")
    }

    if (serviceOrder.status === "completed" || serviceOrder.status === "delivered") {
      throw new Error("Cannot delete completed or delivered service orders")
    }

    return this.serviceOrderRepository.delete(id)
  }

  async startServiceOrder(id: string): Promise<ServiceOrder> {
    if (!id) {
      throw new Error("Service Order ID is required")
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id)
    if (!serviceOrder) {
      throw new Error("Service Order not found")
    }

    if (serviceOrder.status !== "open") {
      throw new Error("Only open service orders can be started")
    }

    return this.serviceOrderRepository.update(id, {
      status: "in_progress",
      startDate: new Date(),
    })
  }

  async completeServiceOrder(id: string): Promise<ServiceOrder> {
    if (!id) {
      throw new Error("Service Order ID is required")
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id)
    if (!serviceOrder) {
      throw new Error("Service Order not found")
    }

    if (serviceOrder.status !== "in_progress" && serviceOrder.status !== "waiting_parts") {
      throw new Error("Only in progress or waiting parts service orders can be completed")
    }

    return this.serviceOrderRepository.update(id, {
      status: "completed",
      completionDate: new Date(),
    })
  }

  async deliverServiceOrder(id: string): Promise<ServiceOrder> {
    if (!id) {
      throw new Error("Service Order ID is required")
    }

    const serviceOrder = await this.serviceOrderRepository.findById(id)
    if (!serviceOrder) {
      throw new Error("Service Order not found")
    }

    if (serviceOrder.status !== "completed") {
      throw new Error("Only completed service orders can be delivered")
    }

    return this.serviceOrderRepository.update(id, { status: "delivered" })
  }
}
