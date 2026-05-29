import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/admin/login')
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
  const isAdminApi = req.nextUrl.pathname.startsWith('/api/admin')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')

  const origin = req.headers.get('origin') || ''
  const isAllowedOrigin = origin.includes('192.168.18.7')

  // Handle preflight CORS requests (OPTIONS)
  if (req.method === 'OPTIONS' && isApiRoute && isAllowedOrigin) {
    const response = new NextResponse(null, { status: 204 })
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  }

  // Protect admin API routes — return 401 JSON instead of redirect
  if (isAdminApi && !isLoggedIn) {
    const response = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    return response
  }

  if (isAdminPage && !isAuthPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl))
  }

  const response = NextResponse.next()

  // Add CORS headers for normal API responses
  if (isApiRoute && isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
})

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}

