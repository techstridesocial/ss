const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Setting up database schema...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Read and execute seed data if it exists
    const seedPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🔄 Running seed data...');
      const seedData = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seedData);
      console.log('✅ Seed data inserted successfully');
    }

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 