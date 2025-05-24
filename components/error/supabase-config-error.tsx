"use client"

import { AlertTriangle, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SupabaseConfigErrorProps {
  errors: string[]
}

export function SupabaseConfigError({ errors }: SupabaseConfigErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
      <Card className="w-full max-w-2xl border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <CardTitle className="text-red-800">Configuração do Supabase Necessária</CardTitle>
              <CardDescription className="text-red-600">
                As variáveis de ambiente do Supabase não estão configuradas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Problemas encontrados:</h3>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="destructive">❌</Badge>
                  <span className="text-sm">{error}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Como corrigir:</h4>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>Acesse o painel do seu projeto no Vercel</li>
              <li>Vá em Settings → Environment Variables</li>
              <li>Adicione as seguintes variáveis:</li>
            </ol>
            <div className="mt-3 p-3 bg-gray-100 rounded font-mono text-sm">
              <div>NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima</div>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Você pode encontrar esses valores no painel do Supabase em Settings → API
            </p>
          </div>

          <div className="flex gap-3">
            <Button asChild>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Supabase Dashboard
              </a>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
