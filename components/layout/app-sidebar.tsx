"use client"

import type * as React from "react"
import { Users, Bike, Package, Wrench, FileText, DollarSign, BarChart3, Settings, Home } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Clientes",
    url: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Motocicletas",
    url: "/dashboard/motorcycles",
    icon: Bike,
  },
  {
    title: "Estoque",
    url: "/dashboard/inventory",
    icon: Package,
  },
  {
    title: "Ordens de Serviço",
    url: "/dashboard/service-orders",
    icon: Wrench,
  },
  {
    title: "Orçamentos",
    url: "/dashboard/budgets",
    icon: FileText,
  },
  {
    title: "Financeiro",
    url: "/dashboard/financial",
    icon: DollarSign,
  },
  {
    title: "Relatórios",
    url: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Wrench className="h-6 w-6" />
          <span className="font-semibold">SaaS Mecânica</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
