import { Pool } from 'pg'

// Create connection pool for better performance
let pool: Pool | null = null

export function getDatabase(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Database pool error:', err)
    })
  }
  
  return pool
}

// Query wrapper with error handling
export async function query<T = any>(
  text: string, 
  params?: any[]
): Promise<T[]> {
  const client = getDatabase()
  
  try {
    const result = await client.query(text, params)
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