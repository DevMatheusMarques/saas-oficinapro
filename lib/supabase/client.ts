import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Variáveis de ambiente do Supabase não encontradas!")
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl)
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Configurada" : "Não configurada")

    // Retorna um cliente mock para evitar crashes
    throw new Error("Configuração do Supabase não encontrada. Verifique as variáveis de ambiente.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
