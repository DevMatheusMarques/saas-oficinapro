import type { ServiceOrder, CreateServiceOrderData } from "../entities/service-order"

export interface ServiceOrderRepository {
  findAll(): Promise<ServiceOrder[]>
  findById(id: string): Promise<ServiceOrder | null>
  findByCustomerId(customerId: string): Promise<ServiceOrder[]>
  findByStatus(status: ServiceOrder["status"]): Promise<ServiceOrder[]>
  create(data: CreateServiceOrderData): Promise<ServiceOrder>
  update(id: string, data: Partial<ServiceOrder>): Promise<ServiceOrder>
  delete(id: string): Promise<void>
}
