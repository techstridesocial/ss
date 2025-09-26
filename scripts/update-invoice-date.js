const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function updateInvoiceDate(newDate) {
  const client = await pool.connect()
  
  try {
    console.log(`🔧 Updating invoice date to: ${newDate}`)
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(newDate)) {
      throw new Error('Date must be in YYYY-MM-DD format')
    }
    
    // Update the main function to use the new date
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
        -- Use the specified date: ${newDate}
        invoice_date := '${newDate}'::DATE;
        
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
    console.log(`✅ Updated generate_invoice_number function to use date: ${newDate}`)
    
    // Test the function
    const testResult = await client.query('SELECT generate_invoice_number() as test_invoice_number')
    console.log('Test invoice number:', testResult.rows[0].test_invoice_number)
    
    console.log('✅ Invoice date updated successfully!')
    
  } catch (error) {
    console.error('❌ Error updating invoice date:', error)
  } finally {
    client.release()
    pool.end()
  }
}

// Get date from command line argument or use current date
const newDate = process.argv[2] || new Date().toISOString().split('T')[0]
updateInvoiceDate(newDate)
