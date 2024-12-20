import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const headers = new Headers(request.headers)
  
  try {
    console.log('Health check: Starting database test')
    const result = await sql`
      SELECT 
        NOW() as time,
        version() as version,
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_addr
    `
    console.log('Health check: Database test successful', result)
    
    return NextResponse.json({ 
      status: 'ok',
      database: {
        connected: true,
        time: result[0].time,
        version: result[0].version,
        name: result[0].database,
        user: result[0].user,
        server: result[0].server_addr
      },
      request: {
        url: requestUrl.toString(),
        host: requestUrl.host,
        originalUrl: headers.get('x-url'),
        hostname: headers.get('x-hostname')
      },
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
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
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  }
} 