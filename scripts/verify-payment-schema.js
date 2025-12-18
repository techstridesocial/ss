#!/usr/bin/env node

/**
 * Verify Payment Schema
 * 
 * This script verifies that the payment-related database tables exist
 * and have the correct schema structure.
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

function getDatabase() {
  return new Pool({
    connectionString: process.env.DATABASE_URL
  })
}

const LOG_PATH = '/Users/jo-remi/Desktop/ss/.cursor/debug.log'

function log(location, message, data = {}) {
  const logEntry = JSON.stringify({
    location,
    message,
    data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'H4'
  })
  fs.appendFileSync(LOG_PATH, logEntry + '\n')
  console.log(`[${location}] ${message}`, data)
}

async function verifyPaymentSchema() {
  log('verify-payment-schema.js:28', 'Starting payment schema verification', {})
  
  const db = getDatabase()

  try {
    // Check if influencer_payments table exists
    log('verify-payment-schema.js:34', 'Checking influencer_payments table', {})
    const paymentsTableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'influencer_payments'
      );
    `)
    
    const paymentsTableExists = paymentsTableCheck.rows[0]?.exists
    log('verify-payment-schema.js:44', 'influencer_payments table check', { exists: paymentsTableExists })

    if (paymentsTableExists) {
      // Get column details
      const paymentsColumns = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'influencer_payments'
        ORDER BY ordinal_position;
      `)
      log('verify-payment-schema.js:54', 'influencer_payments columns', { 
        columns: paymentsColumns.rows.map(r => ({ name: r.column_name, type: r.data_type }))
      })

      // Check for unique constraint on influencer_id
      const uniqueConstraint = await db.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'influencer_payments'
        AND constraint_type = 'UNIQUE';
      `)
      log('verify-payment-schema.js:65', 'influencer_payments constraints', {
        constraints: uniqueConstraint.rows
      })
    }

    // Check if payment_transactions table exists
    log('verify-payment-schema.js:71', 'Checking payment_transactions table', {})
    const transactionsTableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payment_transactions'
      );
    `)
    
    const transactionsTableExists = transactionsTableCheck.rows[0]?.exists
    log('verify-payment-schema.js:81', 'payment_transactions table check', { exists: transactionsTableExists })

    if (transactionsTableExists) {
      const transactionsColumns = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'payment_transactions'
        ORDER BY ordinal_position;
      `)
      log('verify-payment-schema.js:90', 'payment_transactions columns', {
        columns: transactionsColumns.rows.map(r => ({ name: r.column_name, type: r.data_type }))
      })
    }

    // Check payment_method_type enum
    log('verify-payment-schema.js:96', 'Checking payment_method_type enum', {})
    const enumCheck = await db.query(`
      SELECT e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'payment_method_type'
      ORDER BY e.enumsortorder;
    `)
    log('verify-payment-schema.js:105', 'payment_method_type enum values', {
      values: enumCheck.rows.map(r => r.enumlabel)
    })

    // Count existing payment records
    if (paymentsTableExists) {
      const paymentCount = await db.query(`
        SELECT COUNT(*) as count FROM influencer_payments;
      `)
      log('verify-payment-schema.js:114', 'Existing payment records count', {
        count: parseInt(paymentCount.rows[0]?.count || 0)
      })
    }

    if (transactionsTableExists) {
      const transactionCount = await db.query(`
        SELECT COUNT(*) as count FROM payment_transactions;
      `)
      log('verify-payment-schema.js:123', 'Existing transaction records count', {
        count: parseInt(transactionCount.rows[0]?.count || 0)
      })
    }

    log('verify-payment-schema.js:128', 'Payment schema verification completed', {
      paymentsTableExists,
      transactionsTableExists,
      enumExists: enumCheck.rows.length > 0
    })

    process.exit(0)
  } catch (error) {
    log('verify-payment-schema.js:136', 'Error verifying payment schema', {
      error: error.message,
      stack: error.stack
    })
    process.exit(1)
  }
}

verifyPaymentSchema()

