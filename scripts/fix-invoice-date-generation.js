const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function fixInvoiceDateGeneration() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Fixing invoice date generation...')
    
    // Check current database time
    const timeResult = await client.query('SELECT NOW() as db_time, EXTRACT(TIMEZONE FROM NOW()) as timezone_offset')
    console.log('Current database time:', timeResult.rows[0].db_time)
    console.log('Timezone offset:', timeResult.rows[0].timezone_offset)
    
    // Update the function to use a more reliable date source
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_invoice_number()
      RETURNS TEXT AS $$
      DECLARE
        year_part TEXT;
        month_part TEXT;
        sequence_part TEXT;
        invoice_number TEXT;
        invoice_date DATE;
      BEGIN
        -- Use CURRENT_DATE instead of NOW() for more reliable date
        invoice_date := CURRENT_DATE;
        
        -- Format: INV-YYYY-MM-XXXX
        year_part := EXTRACT(YEAR FROM invoice_date)::TEXT;
        month_part := LPAD(EXTRACT(MONTH FROM invoice_date)::TEXT, 2, '0');
        
        -- Get next sequence number for this month
        SELECT COALESCE(MAX(CAST(SUBSTRING(ii.invoice_number FROM 12) AS INTEGER)), 0) + 1
        INTO sequence_part
        FROM influencer_invoices ii
        WHERE ii.invoice_number LIKE 'INV-' || year_part || '-' || month_part || '-%';
        
        -- Format sequence part with leading zeros
        sequence_part := LPAD(sequence_part, 4, '0');
        
        -- Combine all parts
        invoice_number := 'INV-' || year_part || '-' || month_part || '-' || sequence_part;
        
        RETURN invoice_number;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('✅ Updated generate_invoice_number function to use CURRENT_DATE')
    
    // Test the function
    const testResult = await client.query('SELECT generate_invoice_number() as test_invoice_number')
    console.log('Test invoice number:', testResult.rows[0].test_invoice_number)
    
    // Also create a function that allows manual date specification
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_invoice_number_with_date(input_date DATE DEFAULT CURRENT_DATE)
      RETURNS TEXT AS $$
      DECLARE
        year_part TEXT;
        month_part TEXT;
        sequence_part TEXT;
        invoice_number TEXT;
      BEGIN
        -- Format: INV-YYYY-MM-XXXX
        year_part := EXTRACT(YEAR FROM input_date)::TEXT;
        month_part := LPAD(EXTRACT(MONTH FROM input_date)::TEXT, 2, '0');
        
        -- Get next sequence number for this month
        SELECT COALESCE(MAX(CAST(SUBSTRING(ii.invoice_number FROM 12) AS INTEGER)), 0) + 1
        INTO sequence_part
        FROM influencer_invoices ii
        WHERE ii.invoice_number LIKE 'INV-' || year_part || '-' || month_part || '-%';
        
        -- Format sequence part with leading zeros
        sequence_part := LPAD(sequence_part, 4, '0');
        
        -- Combine all parts
        invoice_number := 'INV-' || year_part || '-' || month_part || '-' || sequence_part;
        
        RETURN invoice_number;
      END;
      $$ LANGUAGE plpgsql;
    `)
    console.log('✅ Created generate_invoice_number_with_date function for manual date specification')
    
    // Test with current date
    const currentDateResult = await client.query('SELECT generate_invoice_number_with_date(CURRENT_DATE) as current_invoice_number')
    console.log('Current date invoice number:', currentDateResult.rows[0].current_invoice_number)
    
    // Test with a specific date (e.g., 2024-01-01)
    const specificDateResult = await client.query('SELECT generate_invoice_number_with_date(\'2024-01-01\'::DATE) as specific_invoice_number')
    console.log('Specific date (2024-01-01) invoice number:', specificDateResult.rows[0].specific_invoice_number)
    
    console.log('✅ Invoice date generation fixed!')
    
  } catch (error) {
    console.error('❌ Error fixing invoice date generation:', error)
  } finally {
    client.release()
    pool.end()
  }
}

fixInvoiceDateGeneration()
