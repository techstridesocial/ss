import { Pool } from 'pg'
import { ENV } from '../env'

// Create connection pool for better performance
let pool: Pool | null = null

export function getDatabase(): Pool {
  if (!pool) {
    // Use the pre-validated environment variable
    console.log('🔗 Creating new database pool with URL:', ENV.DATABASE_URL.substring(0, 50) + '...')
    
    pool = new Pool({
      connectionString: ENV.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Optimized for serverless - fewer connections, shorter timeouts
      max: 5, // Reduced for serverless (was 10)
      idleTimeoutMillis: 30000, // 30 seconds (was 60 seconds)
      connectionTimeoutMillis: 5000, // 5 seconds (was 10 seconds)
      // Critical for serverless: allow process to exit when idle
      allowExitOnIdle: true,
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
      // Query timeout for long-running queries
      query_timeout: 15000, // 15 seconds max per query
      // Statement timeout
      statement_timeout: 20000, // 20 seconds
    })
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Database pool error:', err)
    })
    
    // Log pool statistics periodically in development
    if (process.env.NODE_ENV !== 'production') {
      pool.on('connect', () => {
        console.log('🔗 Database connection established')
      })
      
      pool.on('remove', () => {
        console.log('🔌 Database connection removed from pool')
      })
    }
  }
  
  return pool
}

// Query wrapper with error handling
export async function query<T = any>(
  text: string, 
  params?: any[]
): Promise<T[]> {
  const pool = getDatabase()
  
  try {
    const result = await pool.query(text, params)
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Single query wrapper
export async function queryOne<T = any>(
  text: string, 
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

// Transaction wrapper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await getDatabase().connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await query('SELECT 1')
    return true
  } catch {
    return false
  }
} 