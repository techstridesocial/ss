const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function migrateInvoiceSystem() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Starting invoice system migration...')
    
    // Create invoice status enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE invoice_status AS ENUM (
          'DRAFT',
          'SENT', 
          'VERIFIED',
          'DELAYED',
          'PAID',
          'VOIDED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)
    console.log('✅ Created invoice_status enum')

    // Enhanced invoice table with all requirements
    await client.query(`
      CREATE TABLE IF NOT EXISTS influencer_invoices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        
        -- Invoice details
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        invoice_date DATE DEFAULT CURRENT_DATE,
        due_date DATE,
        
        -- Creator details (from your requirements)
        creator_name VARCHAR(255) NOT NULL,
        creator_address TEXT,
        creator_email VARCHAR(255),
        creator_phone VARCHAR(50),
        
        -- Campaign details (from your requirements)
        campaign_reference VARCHAR(100) NOT NULL,
        brand_name VARCHAR(255) NOT NULL,
        content_description TEXT NOT NULL,
        content_link TEXT NOT NULL,
        
        -- Financial details (from your requirements)
        agreed_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'GBP',
        vat_required BOOLEAN DEFAULT FALSE,
        vat_rate DECIMAL(5,2) DEFAULT 20.00,
        vat_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        
        -- Status and workflow
        status invoice_status DEFAULT 'DRAFT',
        staff_notes TEXT,
        payment_terms VARCHAR(50) DEFAULT 'Net 30',
        
        -- File management
        pdf_path VARCHAR(500),
        pdf_generated_at TIMESTAMP WITH TIME ZONE,
        
        -- Audit trail
        created_by UUID REFERENCES users(id),
        verified_by UUID REFERENCES users(id),
        verified_at TIMESTAMP WITH TIME ZONE,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Created influencer_invoices table')

    // Invoice line items for detailed breakdown
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoice_line_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        invoice_id UUID REFERENCES influencer_invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Created invoice_line_items table')

    // Invoice status history for audit trail
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoice_status_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        invoice_id UUID REFERENCES influencer_invoices(id) ON DELETE CASCADE,
        old_status invoice_status,
        new_status invoice_status NOT NULL,
        changed_by UUID REFERENCES users(id),
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('✅ Created invoice_status_history table')

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_influencer_invoices_influencer_id ON influencer_invoices(influencer_id);
      CREATE INDEX IF NOT EXISTS idx_influencer_invoices_campaign_id ON influencer_invoices(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_influencer_invoices_status ON influencer_invoices(status);
      CREATE INDEX IF NOT EXISTS idx_influencer_invoices_created_at ON influencer_invoices(created_at);
    `)
    console.log('✅ Created indexes')

    // Function to generate invoice number
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_invoice_number()
      RETURNS TEXT AS $$
      DECLARE
        year_part TEXT;
        month_part TEXT;
        sequence_part TEXT;
        invoice_number TEXT;
      BEGIN
        -- Format: INV-YYYY-MM-XXXX
        year_part := EXTRACT(YEAR FROM NOW())::TEXT;
        month_part := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
        
        -- Get next sequence number for this month
        SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12) AS INTEGER)), 0) + 1
        INTO sequence_part
        FROM influencer_invoices
        WHERE invoice_number LIKE 'INV-' || year_part || '-' || month_part || '-%';
        
        -- Format sequence part with leading zeros
        sequence_part := LPAD(sequence_part, 4, '0');
        
        -- Combine all parts
        invoice_number := 'INV-' || year_part || '-' || month_part || '-' || sequence_part;
        
        RETURN invoice_number;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('✅ Created generate_invoice_number function')

    // Trigger to auto-generate invoice number
    await client.query(`
      CREATE OR REPLACE FUNCTION set_invoice_number()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
          NEW.invoice_number := generate_invoice_number();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_set_invoice_number ON influencer_invoices;
      CREATE TRIGGER trigger_set_invoice_number
        BEFORE INSERT ON influencer_invoices
        FOR EACH ROW
        EXECUTE FUNCTION set_invoice_number();
    `)
    console.log('✅ Created invoice number trigger')

    // Trigger to update status history
    await client.query(`
      CREATE OR REPLACE FUNCTION log_invoice_status_change()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
          INSERT INTO invoice_status_history (
            invoice_id,
            old_status,
            new_status,
            changed_by,
            reason
          ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.verified_by,
            'Status updated'
          );
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_log_status_change ON influencer_invoices;
      CREATE TRIGGER trigger_log_status_change
        AFTER UPDATE ON influencer_invoices
        FOR EACH ROW
        EXECUTE FUNCTION log_invoice_status_change();
    `)
    console.log('✅ Created status history trigger')

    // Function to calculate VAT and total
    await client.query(`
      CREATE OR REPLACE FUNCTION calculate_invoice_totals()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calculate VAT amount if required
        IF NEW.vat_required THEN
          NEW.vat_amount := NEW.agreed_price * (NEW.vat_rate / 100);
        ELSE
          NEW.vat_amount := 0;
        END IF;
        
        -- Calculate total amount
        NEW.total_amount := NEW.agreed_price + NEW.vat_amount;
        
        -- Set due date if not provided (default to 30 days)
        IF NEW.due_date IS NULL THEN
          NEW.due_date := NEW.invoice_date + INTERVAL '30 days';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_calculate_totals ON influencer_invoices;
      CREATE TRIGGER trigger_calculate_totals
        BEFORE INSERT OR UPDATE ON influencer_invoices
        FOR EACH ROW
        EXECUTE FUNCTION calculate_invoice_totals();
    `)
    console.log('✅ Created totals calculation trigger')

    console.log('🎉 Invoice system migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrateInvoiceSystem().catch(console.error)
