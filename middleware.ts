import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Middleware: Supabase não configurado")
      // Allow access to debug page and static files
      if (
        request.nextUrl.pathname.startsWith("/debug") ||
        request.nextUrl.pathname.startsWith("/_next") ||
        request.nextUrl.pathname.startsWith("/api")
      ) {
        return NextResponse.next()
      }
      // Redirect to a configuration error page if needed
      return NextResponse.next()
    }

    return await updateSession(request)
  } catch (error) {
    console.error("❌ Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
