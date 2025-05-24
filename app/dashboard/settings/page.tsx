"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, User, Bell, Shield, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useSettings } from "@/contexts/settings-context"
import { useToast } from "@/contexts/toast-context"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { success } = useToast()
  const { user } = useAuth()
  const {
    companySettings,
    notificationSettings,
    securitySettings,
    updateCompanySettings,
    updateNotificationSettings,
    updateSecuritySettings,
  } = useSettings()

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

  const handleSaveCompanySettings = () => {
    updateCompanySettings(tempCompanySettings)
    success("Configurações salvas!", "As configurações da empresa foram atualizadas")
  }

  const handleSaveUserProfile = () => {
    // Aqui você implementaria a atualização do perfil do usuário no Supabase
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
    // Aqui você implementaria a mudança de senha no Supabase
    success("Senha alterada!", "Sua senha foi alterada com sucesso")
    setPasswordData({ current: "", new: "", confirm: "" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema e sua conta</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configure as preferências básicas do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input
                      id="company-name"
                      value={tempCompanySettings.name}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Endereço</Label>
                    <Textarea
                      id="company-address"
                      value={tempCompanySettings.address}
                      onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Telefone</Label>
                      <Input
                        id="company-phone"
                        value={tempCompanySettings.phone}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={tempCompanySettings.email}
                        onChange={(e) => setTempCompanySettings({ ...tempCompanySettings, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Preferências do Sistema</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tema</Label>
                      <p className="text-sm text-muted-foreground">Escolha o tema da interface</p>
                    </div>
                    <Select value={theme} onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Claro
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Escuro
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Sistema
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveCompanySettings}>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Suas informações pessoais do usuário autenticado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Nome Completo</Label>
                    <Input
                      id="full-name"
                      value={userProfile.fullName}
                      onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userProfile.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Input
                      id="role"
                      value={userProfile.role}
                      onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ID do Usuário</Label>
                    <Input value={user?.id || ""} disabled className="bg-muted font-mono text-sm" />
                    <p className="text-xs text-muted-foreground">Identificador único do usuário</p>
                  </div>
                </div>
                <Button onClick={handleSaveUserProfile}>Atualizar Perfil</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Mantenha sua conta segura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  />
                </div>
                <Button onClick={handleChangePassword}>Alterar Senha</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Configure como você quer receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Novos Clientes</Label>
                      <p className="text-sm text-muted-foreground">Notificar quando um novo cliente for cadastrado</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newCustomers}
                      onCheckedChange={(checked) => updateNotificationSettings({ newCustomers: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Estoque Baixo</Label>
                      <p className="text-sm text-muted-foreground">Alertar quando peças estiverem com estoque baixo</p>
                    </div>
                    <Switch
                      checked={notificationSettings.lowStock}
                      onCheckedChange={(checked) => updateNotificationSettings({ lowStock: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Orçamentos Pendentes</Label>
                      <p className="text-sm text-muted-foreground">Lembrar de orçamentos aguardando aprovação</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pendingBudgets}
                      onCheckedChange={(checked) => updateNotificationSettings({ pendingBudgets: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Contas Vencidas</Label>
                      <p className="text-sm text-muted-foreground">Alertar sobre contas a pagar vencidas</p>
                    </div>
                    <Switch
                      checked={notificationSettings.overdueBills}
                      onCheckedChange={(checked) => updateNotificationSettings({ overdueBills: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Relatórios Semanais</Label>
                      <p className="text-sm text-muted-foreground">Receber resumo semanal por email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => updateNotificationSettings({ weeklyReports: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>Gerencie a segurança da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => updateSecuritySettings({ twoFactorAuth: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Login por Email</Label>
                      <p className="text-sm text-muted-foreground">Receber notificação de novos logins</p>
                    </div>
                    <Switch
                      checked={securitySettings.emailNotifications}
                      onCheckedChange={(checked) => updateSecuritySettings({ emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sessão Automática</Label>
                      <p className="text-sm text-muted-foreground">Deslogar automaticamente após inatividade</p>
                    </div>
                    <Switch
                      checked={securitySettings.autoLogout}
                      onCheckedChange={(checked) => updateSecuritySettings({ autoLogout: checked })}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Informações da Sessão</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Sessão Atual</p>
                        <p className="text-sm text-muted-foreground">Logado como: {user?.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Último login:{" "}
                          {user?.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleString("pt-BR")
                            : "Não disponível"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ativa
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
