"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, User, Bell, Shield, Save, Mail, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { useToast } from "@/contexts/toast-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function SettingsPage() {
  const { user } = useAuth()
  const {
    companySettings,
    notificationSettings,
    securitySettings,
    updateCompanySettings,
    updateNotificationSettings,
    updateSecuritySettings,
  } = useSettings()
  const { success, error } = useToast()

  const [companyForm, setCompanyForm] = useState({
    name: companySettings.name || "",
    email: companySettings.email || "",
    phone: companySettings.phone || "",
    address: companySettings.address || "",
    city: companySettings.city || "",
    state: companySettings.state || "",
    zipCode: companySettings.zipCode || "",
    cnpj: companySettings.cnpj || "",
    description: companySettings.description || "",
  })

  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: notificationSettings.emailNotifications || false,
    pushNotifications: notificationSettings.pushNotifications || false,
    smsNotifications: notificationSettings.smsNotifications || false,
    marketingEmails: notificationSettings.marketingEmails || false,
  })

  const [securityForm, setSecurityForm] = useState({
    twoFactorAuth: securitySettings.twoFactorAuth || false,
    sessionTimeout: securitySettings.sessionTimeout || "30",
    passwordExpiry: securitySettings.passwordExpiry || "90",
  })

  const handleSaveCompany = async () => {
    try {
      await updateCompanySettings(companyForm)
      success("Sucesso", "Configurações da empresa salvas com sucesso!")
    } catch (err) {
      error("Erro", "Erro ao salvar configurações da empresa")
    }
  }

  const handleSaveNotifications = async () => {
    try {
      await updateNotificationSettings(notificationForm)
      success("Sucesso", "Configurações de notificação salvas com sucesso!")
    } catch (err) {
      error("Erro", "Erro ao salvar configurações de notificação")
    }
  }

  const handleSaveSecurity = async () => {
    try {
      await updateSecuritySettings(securityForm)
      success("Sucesso", "Configurações de segurança salvas com sucesso!")
    } catch (err) {
      error("Erro", "Erro ao salvar configurações de segurança")
    }
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema e da sua conta</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>Suas informações pessoais e dados da conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">{user?.email ? getUserInitials(user.email) : "U"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                      {user?.email_confirmed_at ? "Email Verificado" : "Email Não Verificado"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Membro desde
                  </Label>
                  <Input
                    value={
                      user?.created_at
                        ? format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })
                        : "Não disponível"
                    }
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID do Usuário</Label>
                  <Input value={user?.id || ""} disabled className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Último Acesso</Label>
                  <Input
                    value={
                      user?.last_sign_in_at
                        ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : "Não disponível"
                    }
                    disabled
                  />
                </div>
              </div>

              {user?.app_metadata && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Metadados da Aplicação</Label>
                    <Textarea
                      value={JSON.stringify(user.app_metadata, null, 2)}
                      disabled
                      className="font-mono text-xs"
                      rows={4}
                    />
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
              <CardDescription>Configure os dados da sua oficina</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="Nome da sua oficina"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={companyForm.cnpj}
                    onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    placeholder="contato@suaoficina.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefone</Label>
                  <Input
                    id="companyPhone"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={companyForm.city}
                    onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={companyForm.state}
                    onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                    placeholder="SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={companyForm.zipCode}
                    onChange={(e) => setCompanyForm({ ...companyForm, zipCode: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  placeholder="Descreva sua oficina..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveCompany} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações da Empresa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>Configure como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receba notificações importantes por email</p>
                </div>
                <Switch
                  checked={notificationForm.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationForm({ ...notificationForm, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                </div>
                <Switch
                  checked={notificationForm.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationForm({ ...notificationForm, pushNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por SMS</Label>
                  <p className="text-sm text-muted-foreground">Receba alertas importantes por SMS</p>
                </div>
                <Switch
                  checked={notificationForm.smsNotifications}
                  onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, smsNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emails de Marketing</Label>
                  <p className="text-sm text-muted-foreground">Receba dicas e novidades sobre o sistema</p>
                </div>
                <Switch
                  checked={notificationForm.marketingEmails}
                  onCheckedChange={(checked) => setNotificationForm({ ...notificationForm, marketingEmails: checked })}
                />
              </div>

              <Button onClick={handleSaveNotifications} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Preferências de Notificação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>Gerencie a segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Switch
                  checked={securityForm.twoFactorAuth}
                  onCheckedChange={(checked) => setSecurityForm({ ...securityForm, twoFactorAuth: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                <Select
                  value={securityForm.sessionTimeout}
                  onValueChange={(value) => setSecurityForm({ ...securityForm, sessionTimeout: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Expiração da Senha (dias)</Label>
                <Select
                  value={securityForm.passwordExpiry}
                  onValueChange={(value) => setSecurityForm({ ...securityForm, passwordExpiry: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="180">180 dias</SelectItem>
                    <SelectItem value="365">1 ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveSecurity} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações de Segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
