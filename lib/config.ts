export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aqbbyjoeehckxuhlzvax.supabase.co",
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxYmJ5am9lZWhja3h1aGx6dmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjEwNjksImV4cCI6MjA2MzYzNzA2OX0.CD32ULw9wyZR_G50W1YqbJK3ym8H3JILUWiiOrZAdoI",
  },
  app: {
    name: "OficinaPro",
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
