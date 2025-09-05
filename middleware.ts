import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/polls', request.url))
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/admin',
    '/((?!_next/static|_next/image|favicon.ico|login|register|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}