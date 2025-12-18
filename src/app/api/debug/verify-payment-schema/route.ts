import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/connection'
import fs from 'fs'

const LOG_PATH = '/Users/jo-remi/Desktop/ss/.cursor/debug.log'

function log(location: string, message: string, data: any = {}) {
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
}

export async function GET(_request: NextRequest) {
  try {
    log('api/debug/verify-payment-schema/route.ts:20', 'Starting payment schema verification', {})
    
    const db = getDatabase()

    // Check if influencer_payments table exists
    log('api/debug/verify-payment-schema/route.ts:25', 'Checking influencer_payments table', {})
    const paymentsTableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'influencer_payments'
      );
    `)
    
    const paymentsTableExists = paymentsTableCheck.rows[0]?.exists
    log('api/debug/verify-payment-schema/route.ts:35', 'influencer_payments table check', { exists: paymentsTableExists })

    let paymentsColumns: any[] = []
    let uniqueConstraints: any[] = []
    let paymentCount = 0

    if (paymentsTableExists) {
      // Get column details
      const paymentsColumnsResult = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'influencer_payments'
        ORDER BY ordinal_position;
      `)
      paymentsColumns = paymentsColumnsResult.rows.map((r: any) => ({ 
        name: r.column_name, 
        type: r.data_type 
      }))
      log('api/debug/verify-payment-schema/route.ts:54', 'influencer_payments columns', { columns: paymentsColumns })

      // Check for unique constraint on influencer_id
      const uniqueConstraintResult = await db.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'influencer_payments'
        AND constraint_type = 'UNIQUE';
      `)
      uniqueConstraints = uniqueConstraintResult.rows
      log('api/debug/verify-payment-schema/route.ts:65', 'influencer_payments constraints', { constraints: uniqueConstraints })

      // Count existing payment records
      const paymentCountResult = await db.query(`
        SELECT COUNT(*) as count FROM influencer_payments;
      `)
      paymentCount = parseInt(paymentCountResult.rows[0]?.count || 0)
      log('api/debug/verify-payment-schema/route.ts:73', 'Existing payment records count', { count: paymentCount })
    }

    // Check if payment_transactions table exists
    log('api/debug/verify-payment-schema/route.ts:77', 'Checking payment_transactions table', {})
    const transactionsTableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payment_transactions'
      );
    `)
    
    const transactionsTableExists = transactionsTableCheck.rows[0]?.exists
    log('api/debug/verify-payment-schema/route.ts:87', 'payment_transactions table check', { exists: transactionsTableExists })

    let transactionsColumns: any[] = []
    let transactionCount = 0

    if (transactionsTableExists) {
      const transactionsColumnsResult = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'payment_transactions'
        ORDER BY ordinal_position;
      `)
      transactionsColumns = transactionsColumnsResult.rows.map((r: any) => ({ 
        name: r.column_name, 
        type: r.data_type 
      }))
      log('api/debug/verify-payment-schema/route.ts:103', 'payment_transactions columns', { columns: transactionsColumns })

      const transactionCountResult = await db.query(`
        SELECT COUNT(*) as count FROM payment_transactions;
      `)
      transactionCount = parseInt(transactionCountResult.rows[0]?.count || 0)
      log('api/debug/verify-payment-schema/route.ts:110', 'Existing transaction records count', { count: transactionCount })
    }

    // Check payment_method_type enum
    log('api/debug/verify-payment-schema/route.ts:114', 'Checking payment_method_type enum', {})
    const enumCheck = await db.query(`
      SELECT e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'payment_method_type'
      ORDER BY e.enumsortorder;
    `)
    const enumValues = enumCheck.rows.map((r: any) => r.enumlabel)
    log('api/debug/verify-payment-schema/route.ts:124', 'payment_method_type enum values', { values: enumValues })

    log('api/debug/verify-payment-schema/route.ts:126', 'Payment schema verification completed', {
      paymentsTableExists,
      transactionsTableExists,
      enumExists: enumCheck.rows.length > 0
    })

    return NextResponse.json({
      success: true,
      data: {
        influencer_payments: {
          exists: paymentsTableExists,
          columns: paymentsColumns,
          constraints: uniqueConstraints,
          recordCount: paymentCount
        },
        payment_transactions: {
          exists: transactionsTableExists,
          columns: transactionsColumns,
          recordCount: transactionCount
        },
        payment_method_type_enum: {
          exists: enumValues.length > 0,
          values: enumValues
        }
      }
    })
  } catch (error) {
    log('api/debug/verify-payment-schema/route.ts:154', 'Error verifying payment schema', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

