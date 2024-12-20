import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: '/api/:path*'
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)
  requestHeaders.set('x-hostname', request.nextUrl.hostname)

  try {
    // Pass the request through with added headers
    const response = await NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Return error response
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: 'Internal Server Error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
} 