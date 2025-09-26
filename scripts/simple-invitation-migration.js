#!/usr/bin/env node

/**
 * Simple invitation migration that handles dependencies properly
 */

const { Pool } = require('pg')

async function applyMigration() {
  let pool
  
  try {
    console.log('🚀 Starting invitation tracking migration...')
    
    // Create database connection
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not found in environment variables')
    }
    
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })
    
    console.log('📡 Connected to database')
    
    // Step 1: Create invitation_status enum
    console.log('⏳ Creating invitation_status enum...')
    try {
      await pool.query(`
        CREATE TYPE invitation_status AS ENUM (
          'PENDING',
          'ACCEPTED', 
          'REVOKED',
          'EXPIRED'
        )
      `)
      console.log('✅ invitation_status enum created')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  invitation_status enum already exists')
      } else {
        throw error
      }
    }
    
    // Step 2: Create user_invitations table
    console.log('⏳ Creating user_invitations table...')
    try {
      await pool.query(`
        CREATE TABLE user_invitations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          clerk_invitation_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) NOT NULL,
          role user_role NOT NULL,
          status invitation_status DEFAULT 'PENDING',
          
          -- Invitation details
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
          invited_by_email VARCHAR(255),
          
          -- Timestamps
          invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          accepted_at TIMESTAMP WITH TIME ZONE,
          revoked_at TIMESTAMP WITH TIME ZONE,
          expires_at TIMESTAMP WITH TIME ZONE,
          
          -- Response tracking
          accepted_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          clerk_user_id VARCHAR(255),
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✅ user_invitations table created')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  user_invitations table already exists')
      } else {
        throw error
      }
    }
    
    // Step 3: Create indexes
    console.log('⏳ Creating indexes...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email)',
      'CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status)',
      'CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_by ON user_invitations(invited_by)',
      'CREATE INDEX IF NOT EXISTS idx_user_invitations_clerk_id ON user_invitations(clerk_invitation_id)'
    ]
    
    for (const indexSQL of indexes) {
      try {
        await pool.query(indexSQL)
        console.log(`✅ Index created: ${indexSQL.split(' ')[5]}`)
      } catch (error) {
        console.log(`⚠️  Index may already exist: ${error.message.split('\n')[0]}`)
      }
    }
    
    // Step 4: Create function and trigger
    console.log('⏳ Creating update function and trigger...')
    try {
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_invitation_status()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `)
      console.log('✅ Update function created')
      
      await pool.query(`
        DROP TRIGGER IF EXISTS trigger_update_invitation_status ON user_invitations;
        CREATE TRIGGER trigger_update_invitation_status
            BEFORE UPDATE ON user_invitations
            FOR EACH ROW
            EXECUTE FUNCTION update_invitation_status()
      `)
      console.log('✅ Update trigger created')
    } catch (error) {
      console.log(`⚠️  Function/trigger creation: ${error.message.split('\n')[0]}`)
    }
    
    // Step 5: Create clerk_webhook_events table
    console.log('⏳ Creating clerk_webhook_events table...')
    try {
      await pool.query(`
        CREATE TABLE clerk_webhook_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_type VARCHAR(100) NOT NULL,
          clerk_user_id VARCHAR(255),
          clerk_invitation_id VARCHAR(255),
          event_data JSONB,
          processed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✅ clerk_webhook_events table created')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  clerk_webhook_events table already exists')
      } else {
        throw error
      }
    }
    
    // Step 6: Create webhook indexes
    console.log('⏳ Creating webhook indexes...')
    const webhookIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON clerk_webhook_events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON clerk_webhook_events(processed)',
      'CREATE INDEX IF NOT EXISTS idx_webhook_events_clerk_user ON clerk_webhook_events(clerk_user_id)',
      'CREATE INDEX IF NOT EXISTS idx_webhook_events_clerk_invitation ON clerk_webhook_events(clerk_invitation_id)'
    ]
    
    for (const indexSQL of webhookIndexes) {
      try {
        await pool.query(indexSQL)
        console.log(`✅ Webhook index created: ${indexSQL.split(' ')[5]}`)
      } catch (error) {
        console.log(`⚠️  Webhook index may already exist: ${error.message.split('\n')[0]}`)
      }
    }
    
    console.log('')
    console.log('🎉 Migration completed successfully!')
    console.log('')
    console.log('✅ Database tables created:')
    console.log('   - user_invitations (with indexes)')
    console.log('   - clerk_webhook_events (with indexes)')
    console.log('   - invitation_status enum')
    console.log('   - Update triggers')
    console.log('')
    console.log('🔧 Next steps:')
    console.log('1. Add CLERK_WEBHOOK_SECRET to your .env.local')
    console.log('2. Configure Clerk webhook endpoint: /api/webhooks/clerk')
    console.log('3. Test the invitation system!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
      console.log('📡 Database connection closed')
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

applyMigration()
