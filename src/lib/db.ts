import { neon, neonConfig } from '@neondatabase/serverless'

// Configure neon for Edge runtime
neonConfig.wsProxy = (host) => `${host}/v1`
neonConfig.useSecureWebSocket = true

const sql = (() => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  try {
    const connection = neon(process.env.DATABASE_URL)
    
    // Test the connection immediately
    connection`SELECT 1 as test`.then(
      () => console.log('Database connection initialized successfully'),
      (error) => console.error('Failed to test database connection:', error)
    )
    
    return connection
  } catch (error) {
    console.error('Failed to initialize database connection:', error)
    throw error
  }
})()

export { sql }