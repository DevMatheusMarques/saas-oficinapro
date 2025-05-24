"use client"

import { Calendar, Car, DollarSign, FileText, Home, Package, Settings, Users, Wrench, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"

const menuItems = [
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
    title: "Motos",
    url: "/dashboard/motorcycles",
    icon: Car,
  },
  {
    title: "Orçamentos",
    url: "/dashboard/budgets",
    icon: FileText,
  },
  {
    title: "Ordens de Serviço",
    url: "/dashboard/service-orders",
    icon: Wrench,
  },
  {
    title: "Estoque",
    url: "/dashboard/inventory",
    icon: Package,
  },
  {
    title: "Financeiro",
    url: "/dashboard/financial",
    icon: DollarSign,
  },
  {
    title: "Relatórios",
    url: "/dashboard/reports",
    icon: Calendar,
  },
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { companySettings } = useSettings()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">OficinaPro</h2>
            <p className="text-sm text-muted-foreground">{companySettings.name || "Sistema de Gestão"}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  <span>{user?.user_metadata?.full_name || user?.email || "Usuário"}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
