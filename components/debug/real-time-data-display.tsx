"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RealTimeDataDisplay() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      try {
        const [customers, motorcycles, parts, categories, budgets, serviceOrders, payments] = await Promise.all([
          supabase.from("customers").select("*").limit(3),
          supabase.from("motorcycles").select("*").limit(3),
          supabase.from("parts").select("*").limit(3),
          supabase.from("part_categories").select("*"),
          supabase.from("budgets").select("*"),
          supabase.from("service_orders").select("*"),
          supabase.from("payments").select("*"),
        ])

        setData({
          customers: customers.data || [],
          motorcycles: motorcycles.data || [],
          parts: parts.data || [],
          categories: categories.data || [],
          budgets: budgets.data || [],
          serviceOrders: serviceOrders.data || [],
          payments: payments.data || [],
        })
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados em Tempo Real</CardTitle>
          <CardDescription>Carregando dados do Supabase...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados em Tempo Real do Supabase</CardTitle>
        <CardDescription>Visualização dos dados reais das tabelas</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="customers">
              Clientes <Badge className="ml-2">{data.customers?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="motorcycles">
              Motos <Badge className="ml-2">{data.motorcycles?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="parts">
              Peças <Badge className="ml-2">{data.parts?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="budgets">
              Orçamentos <Badge className="ml-2">{data.budgets?.length || 0}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-2">
            <h3 className="font-semibold">Últimos Clientes:</h3>
            {data.customers?.map((customer: any) => (
              <div key={customer.id} className="p-3 border rounded">
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-muted-foreground">{customer.email}</div>
                <div className="text-sm text-muted-foreground">{customer.phone}</div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="motorcycles" className="space-y-2">
            <h3 className="font-semibold">Últimas Motos:</h3>
            {data.motorcycles?.map((moto: any) => (
              <div key={moto.id} className="p-3 border rounded">
                <div className="font-medium">
                  {moto.brand} {moto.model}
                </div>
                <div className="text-sm text-muted-foreground">Placa: {moto.license_plate}</div>
                <div className="text-sm text-muted-foreground">Ano: {moto.year}</div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="parts" className="space-y-2">
            <h3 className="font-semibold">Últimas Peças:</h3>
            {data.parts?.map((part: any) => (
              <div key={part.id} className="p-3 border rounded">
                <div className="font-medium">{part.name}</div>
                <div className="text-sm text-muted-foreground">Estoque: {part.stock_quantity}</div>
                <div className="text-sm text-muted-foreground">Preço: R$ {part.sale_price}</div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="budgets" className="space-y-2">
            <h3 className="font-semibold">Orçamentos:</h3>
            {data.budgets?.map((budget: any) => (
              <div key={budget.id} className="p-3 border rounded">
                <div className="font-medium">{budget.budget_number}</div>
                <div className="text-sm text-muted-foreground">Status: {budget.status}</div>
                <div className="text-sm text-muted-foreground">Total: R$ {budget.total_amount}</div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
