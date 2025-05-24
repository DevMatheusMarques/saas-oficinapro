import { CompleteSystemTest } from "@/components/debug/complete-system-test"
import { RealTimeDataDisplay } from "@/components/debug/real-time-data-display"

export default function DebugPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug & Verificação do Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Verificação completa da integração com Supabase e funcionalidades do sistema
        </p>
      </div>

      <CompleteSystemTest />
      <RealTimeDataDisplay />
    </div>
  )
}
