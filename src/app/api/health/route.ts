import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Segment Configuration
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'iad1'
export const maxDuration = 10

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

export async function GET(request: Request) {
  console.log('Health check route hit:', request.url)
  
  try {
    // Simpler query to reduce edge runtime overhead
    const result = await sql`
      SELECT 
        NOW() as time,
        current_database() as database
    `
    
    return NextResponse.json({
      status: 'ok',
      database: {
        connected: true,
        time: result[0].time,
        name: result[0].database
      },
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    })
  }
} 