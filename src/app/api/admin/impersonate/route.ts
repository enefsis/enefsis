import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token')

  if (!tokenHash) {
    return NextResponse.redirect(new URL('/admin/clients', request.url))
  }

  // Build the response first so we can attach cookies to it
  const response = NextResponse.redirect(new URL('/dashboard', request.url))

  // Create an SSR Supabase client that reads from the request and writes
  // session cookies directly onto the response — no fragments, no cache misses
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink',
  })

  if (error) {
    const errUrl = new URL('/admin/clients', request.url)
    errUrl.searchParams.set('impersonate_error', error.message)
    return NextResponse.redirect(errUrl)
  }

  // Mark this tab as an impersonation session so the dashboard banner shows
  response.cookies.set('admin_impersonating', 'true', {
    path:     '/',
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   60 * 60 * 2,
  })

  return response
}
