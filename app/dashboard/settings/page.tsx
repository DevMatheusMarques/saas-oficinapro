"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Building2, Palette, Shield, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function SettingsPage() {
  const { user } = useAuth()
  const { settings, updateSettings } = useSettings()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [companyName, setCompanyName] = useState(settings.companyName)
  const [companyEmail, setCompanyEmail] = useState(settings.companyEmail)
  const [companyPhone, setCompanyPhone] = useState(settings.companyPhone)
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress)
  const [notifications, setNotifications] = useState(settings.notifications)
  const [autoBackup, setAutoBackup] = useState(settings.autoBackup)

  useEffect(() => {
    setCompanyName(settings.companyName)
    setCompanyEmail(settings.companyEmail)
    setCompanyPhone(settings.companyPhone)
    setCompanyAddress(settings.companyAddress)
    setNotifications(settings.notifications)
    setAutoBackup(settings.autoBackup)
  }, [settings])

  const handleSaveCompanySettings = async () => {
    try {
      await updateSettings({
        companyName,
        companyEmail,
        companyPhone,
        companyAddress,
      })
      toast({
        title: "Sucesso",
        description: "Configurações da empresa salvas com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações da empresa.",
        variant: "destructive",
      })
    }
  }

  const handleSavePreferences = async () => {
    try {
      await updateSettings({
        notifications,
        autoBackup,
      })
      toast({
        title: "Sucesso",
        description: "Preferências salvas com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar preferências.",
        variant: "destructive",
      })
    }
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const formatUserMetadata = (metadata: any) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return "Nenhum dado adicional"
    }

    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema e da sua conta</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>Informações da sua conta de usuário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{user?.email ? getUserInitials(user.email) : "U"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary">{user?.role || "Usuário"}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ID do Usuário</Label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">{user?.id || "Não disponível"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email Verificado</Label>
                  <p className="text-sm">
                    {user?.email_confirmed_at ? (
                      <Badge variant="default">Verificado</Badge>
                    ) : (
                      <Badge variant="destructive">Não verificado</Badge>
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data de Cadastro</Label>
                  <p className="text-sm">
                    {user?.created_at
                      ? format(new Date(user.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : "Não disponível"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Último Acesso</Label>
                  <p className="text-sm">
                    {user?.last_sign_in_at
                      ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : "Não disponível"}
                  </p>
                </div>
              </div>

              {user?.user_metadata && Object.keys(user.user_metadata).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Metadados do Usuário</Label>
                    <div className="text-sm bg-muted p-3 rounded">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(user.user_metadata, null, 2)}</pre>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>Configure as informações da sua oficina</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome da sua oficina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email da Empresa</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contato@suaoficina.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefone da Empresa</Label>
                  <Input
                    id="companyPhone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Endereço</Label>
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Endereço completo da oficina"
                  />
                </div>
              </div>
              <Button onClick={handleSaveCompanySettings}>Salvar Configurações da Empresa</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema</Label>
                  <p className="text-sm text-muted-foreground">Escolha entre tema claro ou escuro</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    Claro
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                    Escuro
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                  >
                    Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações e Backup</CardTitle>
              <CardDescription>Configure suas preferências de notificações e backup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações do sistema</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">Fazer backup automático dos dados</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
              <Button onClick={handleSavePreferences}>Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
              <CardDescription>Informações sobre o sistema OficinaPro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome do Sistema</Label>
                  <p className="text-sm">OficinaPro</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Versão</Label>
                  <p className="text-sm">1.0.0</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ambiente</Label>
                  <Badge variant="secondary">
                    {process.env.NODE_ENV === "production" ? "Produção" : "Desenvolvimento"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Banco de Dados</Label>
                  <p className="text-sm">Supabase PostgreSQL</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>Configurações relacionadas à segurança do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sessão Atual</Label>
                <p className="text-sm">
                  Logado desde:{" "}
                  {user?.last_sign_in_at
                    ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                    : "Não disponível"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Provedor de Autenticação</Label>
                <p className="text-sm">{user?.app_metadata?.provider || "Email"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
