import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
  try {
    console.log('Health check: Starting database test')
    // Test database connection
    const result = await sql`SELECT 1 as test`
    console.log('Health check: Database test successful', result)
    return NextResponse.json({ 
      status: 'ok',
      database: 'connected',
      test: result[0].test,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 