import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Handle preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// Handle GET requests
export async function GET(request: Request) {
  // Ensure we're actually hitting this route
  console.log('Health check route hit:', request.url)
  
  const requestUrl = new URL(request.url)
  const headers = new Headers(request.headers)
  
  try {
    console.log('Health check: Starting database test')
    const testResult = await sql`SELECT 1 as test`
    console.log('Initial connection test:', testResult)

    const result = await sql`
      SELECT 
        NOW() as time,
        version() as version,
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_addr,
        pg_backend_pid() as backend_pid
    `
    console.log('Health check: Database test successful', result)
    
    // Return success response
    return new NextResponse(
      JSON.stringify({
        status: 'ok',
        database: {
          connected: true,
          time: result[0].time,
          version: result[0].version,
          name: result[0].database,
          user: result[0].user,
          server: result[0].server_addr,
          pid: result[0].backend_pid
        },
        request: {
          url: requestUrl.toString(),
          host: requestUrl.host,
          originalUrl: headers.get('x-url'),
          hostname: headers.get('x-hostname')
        },
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    
    // Return error response
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        request: {
          url: requestUrl.toString(),
          host: requestUrl.host,
          originalUrl: headers.get('x-url'),
          hostname: headers.get('x-hostname')
        },
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      }
    )
  }
} 