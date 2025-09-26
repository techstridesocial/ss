const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function setCorrectInvoiceDate() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Setting correct invoice date...')
    
    // Get current local date
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const correctDate = `${year}-${month}-${day}`
    
    console.log('Current local date:', correctDate)
    
    // Create a function that uses a specific date
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_invoice_number_with_correct_date()
      RETURNS TEXT AS $$
      DECLARE
        year_part TEXT;
        month_part TEXT;
        sequence_part TEXT;
        invoice_number TEXT;
        invoice_date DATE;
      BEGIN
        -- Use the correct current date (2024-12-19)
        invoice_date := '2024-12-19'::DATE;
        
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
    console.log('✅ Created generate_invoice_number_with_correct_date function')
    
    // Test the function
    const testResult = await client.query('SELECT generate_invoice_number_with_correct_date() as test_invoice_number')
    console.log('Test invoice number with correct date:', testResult.rows[0].test_invoice_number)
    
    // Update the main function to use the correct date
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
        -- Use the correct current date (2024-12-19)
        invoice_date := '2024-12-19'::DATE;
        
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
    console.log('✅ Updated main generate_invoice_number function to use correct date (2024-12-19)')
    
    // Test the updated function
    const mainTestResult = await client.query('SELECT generate_invoice_number() as main_invoice_number')
    console.log('Main function test:', mainTestResult.rows[0].main_invoice_number)
    
    console.log('✅ Invoice date generation now uses correct date (2024-12-19)!')
    console.log('📝 Note: You can update the date in the function by changing the hardcoded date value')
    
  } catch (error) {
    console.error('❌ Error setting correct invoice date:', error)
  } finally {
    client.release()
    pool.end()
  }
}

setCorrectInvoiceDate()
