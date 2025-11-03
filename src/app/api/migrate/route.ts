import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/connection'

export async function POST(req: NextRequest) {
  try {
    // Simple auth check - you could add more security here
    const { password } = await req.json()
    
    if (password !== 'migrate-tracking-links') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create tracking_links table
    await query(`
      CREATE TABLE IF NOT EXISTS tracking_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
        short_io_link_id VARCHAR(255) UNIQUE NOT NULL,
        short_url TEXT NOT NULL,
        original_url TEXT NOT NULL,
        title VARCHAR(255),
        clicks INTEGER DEFAULT 0,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_tracking_links_influencer ON tracking_links(influencer_id)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_tracking_links_short_io_id ON tracking_links(short_io_link_id)
    `)

    return NextResponse.json({ success: true, message: 'Tracking links table created successfully' })

  } catch (_error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
} 