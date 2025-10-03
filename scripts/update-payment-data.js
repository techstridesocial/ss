const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Mock payment details for each influencer
// Only includes PAYPAL and BANK_TRANSFER (the actual payment methods supported by the system)
const mockPaymentDetails = {
  'PewDiePie': {
    method: 'PAYPAL',
    details: {
      email: 'pewdiepie@gmail.com',
      firstName: 'Felix',
      lastName: 'Kjellberg'
    }
  },
  'Charli D\'Amelio': {
    method: 'BANK_TRANSFER',
    details: {
      accountType: 'Personal Account',
      accountHolderName: 'Charli D\'Amelio',
      accountNumber: '1234567890',
      routingNumber: '021000021',
      abaCode: '',
      bankName: 'Chase Bank',
      swiftCode: 'CHASUS33',
      iban: '',
      address: '123 Dance Street',
      city: 'Los Angeles',
      country: 'United States',
      currency: 'USD',
      vatRegistered: 'No'
    }
  },
  'Kylie Jenner': {
    method: 'BANK_TRANSFER',
    details: {
      accountType: 'Business Account',
      accountHolderName: 'Kylie Jenner',
      accountNumber: '9876543210',
      routingNumber: '121000248',
      abaCode: '',
      bankName: 'Wells Fargo',
      swiftCode: 'WFBIUS6S',
      iban: '',
      address: '456 Cosmetics Ave',
      city: 'Calabasas',
      country: 'United States',
      currency: 'USD',
      vatRegistered: 'Yes'
    }
  },
  'MrBeast': {
    method: 'PAYPAL',
    details: {
      email: 'jimmy@mrbeast.com',
      firstName: 'Jimmy',
      lastName: 'Donaldson'
    }
  },
  'Addison Rae': {
    method: 'BANK_TRANSFER',
    details: {
      accountType: 'Personal Account',
      accountHolderName: 'Addison Rae Easterling',
      accountNumber: '5555666677',
      routingNumber: '026009593',
      abaCode: '',
      bankName: 'Bank of America',
      swiftCode: 'BOFAUS3N',
      iban: '',
      address: '789 Creator Lane',
      city: 'Los Angeles',
      country: 'United States',
      currency: 'USD',
      vatRegistered: 'No'
    }
  },
  'Emma Chamberlain': {
    method: 'PAYPAL',
    details: {
      email: 'emma@emmachamberlain.com',
      firstName: 'Emma',
      lastName: 'Chamberlain'
    }
  }
};

async function updatePaymentData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Updating payment data for dashboard influencers...');
    
    // First, let's see what influencers we have
    const influencersResult = await pool.query(`
      SELECT 
        i.id,
        i.display_name,
        up.first_name,
        up.last_name
      FROM influencers i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY i.display_name
    `);
    
    console.log('📋 Found influencers in database:');
    influencersResult.rows.forEach(inf => {
      console.log(`  - ${inf.display_name} (${inf.first_name} ${inf.last_name})`);
    });
    
    // Update payment data for each influencer
    for (const [displayName, paymentData] of Object.entries(mockPaymentDetails)) {
      console.log(`\n💳 Updating payment data for ${displayName}...`);
      
      // Find the influencer by display name
      const influencerResult = await pool.query(`
        SELECT i.id
        FROM influencers i
        WHERE i.display_name ILIKE $1
        LIMIT 1
      `, [`%${displayName}%`]);
      
      if (influencerResult.rows.length === 0) {
        console.log(`⚠️  No influencer found for "${displayName}"`);
        continue;
      }
      
      const influencerId = influencerResult.rows[0].id;
      
      // Delete existing payment data
      await pool.query(`
        DELETE FROM influencer_payments WHERE influencer_id = $1
      `, [influencerId]);
      
      // Insert new payment data
      const encryptedDetails = JSON.stringify(paymentData.details); // In real app, this would be encrypted
      
      await pool.query(`
        INSERT INTO influencer_payments (
          influencer_id,
          payment_method,
          encrypted_details,
          is_verified,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [influencerId, paymentData.method, encryptedDetails, true]);
      
      console.log(`✅ Updated ${paymentData.method} payment method for ${displayName}`);
    }
    
    // Verify the data was updated
    console.log('\n📊 Payment data summary:');
    const paymentSummary = await pool.query(`
      SELECT 
        i.display_name,
        ip.payment_method,
        ip.is_verified,
        ip.created_at
      FROM influencer_payments ip
      JOIN influencers i ON ip.influencer_id = i.id
      ORDER BY i.display_name
    `);
    
    paymentSummary.rows.forEach(payment => {
      console.log(`  - ${payment.display_name}: ${payment.payment_method} (${payment.is_verified ? 'Verified' : 'Pending'})`);
    });
    
    console.log('\n🎉 Payment data updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating payment data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updatePaymentData();

