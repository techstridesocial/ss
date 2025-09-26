const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function updateInvoiceNumberFormat() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Updating invoice number format to INV-SS-XXXX...')
    
    // Update the generate_invoice_number function to use INV-SS-XXXX format
    await client.query(`
      CREATE OR REPLACE FUNCTION generate_invoice_number()
      RETURNS TEXT AS $$
      DECLARE
        sequence_part TEXT;
        invoice_number TEXT;
      BEGIN
        -- Format: INV-SS-XXXX
        -- Get next sequence number (global, not monthly)
        SELECT COALESCE(MAX(CAST(SUBSTRING(ii.invoice_number FROM 8) AS INTEGER)), 0) + 1
        INTO sequence_part
        FROM influencer_invoices ii
        WHERE ii.invoice_number LIKE 'INV-SS-%';
        
        -- Format sequence part with leading zeros
        sequence_part := LPAD(sequence_part, 4, '0');
        
        -- Combine all parts
        invoice_number := 'INV-SS-' || sequence_part;
        
        RETURN invoice_number;
      END;
      $$ LANGUAGE plpgsql;
    `)
    
    console.log('✅ Updated generate_invoice_number function to use INV-SS-XXXX format')
    
    // Test the function
    const testResult = await client.query('SELECT generate_invoice_number() as test_number')
    console.log('🧪 Test invoice number:', testResult.rows[0].test_number)
    
    console.log('✅ Invoice number format updated successfully!')
    console.log('📋 New format: INV-SS-0001, INV-SS-0002, etc.')
    
  } catch (error) {
    console.error('❌ Error updating invoice number format:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

updateInvoiceNumberFormat()
  .then(() => {
    console.log('🎉 Invoice number format update completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to update invoice number format:', error)
    process.exit(1)
  })
