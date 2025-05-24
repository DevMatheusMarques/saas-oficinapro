export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  app: {
    name: "SaaS Mecânica Motos",
    version: "1.0.0",
  },
}

export function validateSupabaseConfig() {
  const { url, anonKey } = config.supabase

  if (!url || !anonKey) {
    console.error("❌ Configuração do Supabase inválida!")
    console.error("URL:", url || "NÃO CONFIGURADA")
    console.error("Key:", anonKey ? "CONFIGURADA" : "NÃO CONFIGURADA")

    return {
      isValid: false,
      errors: [
        !url && "NEXT_PUBLIC_SUPABASE_URL não configurada",
        !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada",
      ].filter(Boolean),
    }
  }

  return {
    isValid: true,
    errors: [],
  }
}
