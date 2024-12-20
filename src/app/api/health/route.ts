import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  
  try {
    console.log('Health check: Starting database test')
    const result = await sql`SELECT NOW() as time, version() as version`
    console.log('Health check: Database test successful', result)
    
    return NextResponse.json({ 
      status: 'ok',
      database: {
        connected: true,
        time: result[0].time,
        version: result[0].version
      },
      request: {
        url: requestUrl.toString(),
        host: requestUrl.host
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
        host: requestUrl.host
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