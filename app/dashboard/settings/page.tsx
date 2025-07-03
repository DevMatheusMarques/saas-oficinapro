"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Info, Monitor, Moon, Palette, Shield, Sun, User } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/contexts/toast-context"

export default function SettingsPage() {
  /**
   * CONTEXTS
   */
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { success } = useToast()
  const {
    companySettings,
    notificationSettings,
    securitySettings,
    updateCompanySettings,
    updateNotificationSettings,
    updateSecuritySettings,
  } = useSettings()

  /**
   * LOCAL STATE
   */
  const [tempCompanySettings, setTempCompanySettings] = useState(companySettings)

  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
  })

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  /**
   * EFFECTS
   */
  useEffect(() => {
    if (user) {
      setUserProfile({
        fullName: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        role: user.user_metadata?.role || "Administrador",
      })
    }
  }, [user])

  /**
   * HANDLERS
   */
  const handleSaveCompanySettings = () => {
    updateCompanySettings(tempCompanySettings)
    success("Configurações salvas!", "As configurações da empresa foram atualizadas")
  }

  const handleSaveUserProfile = () => {
    // aqui você atualizaria o perfil no Supabase
    success("Perfil atualizado!", "Suas informações pessoais foram atualizadas")
  }

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("As senhas não coincidem!")
      return
    }
    if (passwordData.new.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!")
      return
    }
    // aqui você faria a troca de senha no Supabase
    success("Senha alterada!", "Sua senha foi alterada com sucesso")
    setPasswordData({ current: "", new: "", confirm: "" })
  }

  /**
   * HELPERS
   */
  const getInitials = (fullName: string | undefined) =>
    (fullName || "US")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  /**
   * RENDER
   */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema e sua conta</p>
        </header>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* GERAL */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Empresa</CardTitle>
                <CardDescription>Informações básicas da sua oficina</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input
                      id="company-name"
                      value={tempCompanySettings.name}
                      onChange={(e) =>
                        setTempCompanySettings({
                          ...tempCompanySettings,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Endereço</Label>
                    <Textarea
                      id="company-address"
                      value={tempCompanySettings.address}
                      onChange={(e) =>
                        setTempCompanySettings({
                          ...tempCompanySettings,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Telefone</Label>
                      <Input
                        id="company-phone"
                        value={tempCompanySettings.phone}
                        onChange={(e) =>
                          setTempCompanySettings({
                            ...tempCompanySettings,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={tempCompanySettings.email}
                        onChange={(e) =>
                          setTempCompanySettings({
                            ...tempCompanySettings,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Tema</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm">Escolha a aparência do sistema</p>
                    </div>
                    <Select value={theme} onValueChange={(val: "light" | "dark" | "system") => setTheme(val)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <Sun className="mr-2 h-4 w-4" />
                          Claro
                        </SelectItem>
                        <SelectItem value="dark">
                          <Moon className="mr-2 h-4 w-4" />
                          Escuro
                        </SelectItem>
                        <SelectItem value="system">
                          <Monitor className="mr-2 h-4 w-4" />
                          Sistema
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveCompanySettings}>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PERFIL */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Dados pessoais do usuário autenticado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>{getInitials(user?.user_metadata?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{userProfile.fullName || "Usuário"}</h3>
                    <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                    <Badge variant="secondary">{userProfile.role || "Usuário"}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Nome Completo</Label>
                    <Input
                      id="full-name"
                      value={userProfile.fullName}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userProfile.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Input
                      id="role"
                      value={userProfile.role}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          role: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveUserProfile}>Atualizar Perfil</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Atualize sua senha</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm: e.target.value,
                      })
                    }
                  />
                </div>

                <Button onClick={handleChangePassword}>Alterar Senha</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICAÇÕES */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Controle de alertas e notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Novos Clientes</Label>
                      <p className="text-sm text-muted-foreground">Avisar quando um cliente for criado</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newCustomers}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          newCustomers: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Estoque Baixo</Label>
                      <p className="text-sm text-muted-foreground">Alerta quando peça estiver no mínimo</p>
                    </div>
                    <Switch
                      checked={notificationSettings.lowStock}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          lowStock: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Orçamentos Pendentes</Label>
                      <p className="text-sm text-muted-foreground">Lembrete de aprovação de orçamento</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pendingBudgets}
                      onCheckedChange={(checked) =>
                        updateNotificationSettings({
                          pendingBudgets: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEGURANÇA */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>Proteja sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de 2 Fatores</Label>
                    <p className="text-sm text-muted-foreground">Camada extra de segurança</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      updateSecuritySettings({
                        twoFactorAuth: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações de Login</Label>
                    <p className="text-sm text-muted-foreground">Receber email em novos logins</p>
                  </div>
                  <Switch
                    checked={securitySettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      updateSecuritySettings({
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Logout Automático</Label>
                    <p className="text-sm text-muted-foreground">Sair após período inativo</p>
                  </div>
                  <Switch
                    checked={securitySettings.autoLogout}
                    onCheckedChange={(checked) =>
                      updateSecuritySettings({
                        autoLogout: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessão Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Último login:{" "}
                  {user?.last_sign_in_at
                    ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })
                    : "Não disponível"}
                </p>
                <p className="text-sm">Provedor: {user?.app_metadata?.provider || "email"}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
