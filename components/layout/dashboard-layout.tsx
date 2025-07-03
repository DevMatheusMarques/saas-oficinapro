"use client"

import type React from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const pathTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/customers": "Clientes",
  "/dashboard/motorcycles": "Motocicletas",
  "/dashboard/budgets": "Orçamentos",
  "/dashboard/service-orders": "Ordens de Serviço",
  "/dashboard/inventory": "Estoque",
  "/dashboard/financial": "Financeiro",
  "/dashboard/reports": "Relatórios",
  "/dashboard/settings": "Configurações",
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const currentTitle = pathTitles[pathname] || "Dashboard"

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = []

    if (segments.length > 1) {
      breadcrumbs.push({
        title: "Dashboard",
        href: "/dashboard",
        isLast: false,
      })
    }

    if (segments.length > 2) {
      const currentPath = `/${segments.slice(0, -1).join("/")}`
      breadcrumbs.push({
        title: pathTitles[currentPath] || segments[segments.length - 2],
        href: currentPath,
        isLast: false,
      })
    }

    breadcrumbs.push({
      title: currentTitle,
      href: pathname,
      isLast: true,
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.href} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {breadcrumb.isLast ? (
                        <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.title}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
