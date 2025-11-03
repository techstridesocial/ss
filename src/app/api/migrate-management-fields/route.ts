import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export async function POST(_request: NextRequest) {
  try {
    console.log('Starting migration to add management fields...')

    // Check if columns already exist
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'influencers' 
      AND column_name IN ('assigned_to', 'labels', 'notes')
    `
    
    const existingColumns = await pool.query(checkQuery)
    const existingColumnNames = existingColumns.rows.map(row => row.column_name)
    
    console.log('Existing columns:', existingColumnNames)

    // Add missing columns
    const alterQueries = []
    
    if (!existingColumnNames.includes('assigned_to')) {
      alterQueries.push('ALTER TABLE influencers ADD COLUMN assigned_to VARCHAR(255)')
    }
    
    if (!existingColumnNames.includes('labels')) {
      alterQueries.push('ALTER TABLE influencers ADD COLUMN labels TEXT[]')
    }
    
    if (!existingColumnNames.includes('notes')) {
      alterQueries.push('ALTER TABLE influencers ADD COLUMN notes TEXT')
    }

    if (alterQueries.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'All management fields already exist'
      })
    }

    // Execute the ALTER TABLE statements
    for (const query of alterQueries) {
      console.log('Executing:', query)
      await pool.query(query)
    }

    console.log('Migration completed successfully')

    return NextResponse.json({ 
      success: true, 
      message: `Added ${alterQueries.length} management fields to influencers table`,
      fieldsAdded: alterQueries
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 