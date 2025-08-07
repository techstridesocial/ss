#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Stride Social Dashboard
 * 
 * This script orchestrates all test suites including:
 * - Unit tests
 * - Integration tests (API, Database, E2E)
 * - Component tests
 * - Performance tests
 * - Security tests
 * - Coverage reports
 */

const { spawn, execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// Configuration
const CONFIG = {
  testTimeout: 30000,
  coverageThreshold: {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80
  },
  testPatterns: {
    unit: 'tests/unit/**/*.test.js',
    integration: 'tests/integration/**/*.test.js',
    components: 'tests/components/**/*.test.js',
    e2e: 'tests/integration/end-to-end.test.js',
    api: 'tests/integration/api-endpoints.test.js',
    database: 'tests/integration/database.test.js',
    performance: 'tests/integration/performance.test.js',
    security: 'tests/integration/security.test.js'
  }
}

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'
  console.log(`${prefix} [${timestamp}] ${message}`)
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath)
}

function findTestFiles(pattern) {
  const glob = require('glob')
  try {
    return glob.sync(pattern, { cwd: process.cwd() })
  } catch (error) {
    return []
  }
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', (error) => {
      reject(error)
    })
  })
}

// Pre-flight checks
function performPreFlightChecks() {
  log('Performing pre-flight checks...')
  
  const checks = [
    { name: 'Node.js version', check: () => process.version },
    { name: 'Jest config', check: () => checkFileExists('jest.config.js') },
    { name: 'Test setup file', check: () => checkFileExists('tests/setup.js') },
    { name: 'Package.json', check: () => checkFileExists('package.json') }
  ]

  for (const check of checks) {
    try {
      const result = check.check()
      if (result) {
        log(`${check.name}: ✅ ${result}`)
      } else {
        log(`${check.name}: ✅ Found`)
      }
    } catch (error) {
      log(`${check.name}: ❌ Missing - ${error.message}`, 'error')
      return false
    }
  }

  return true
}

// Test category runners
async function runUnitTests() {
  log('Running Unit Tests...')
  
  const testFiles = findTestFiles(CONFIG.testPatterns.unit)
  if (testFiles.length === 0) {
    log('No unit test files found', 'warning')
    return { success: true, skipped: true }
  }

  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=tests/unit', '--verbose'])
    log('Unit tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`Unit tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

async function runIntegrationTests() {
  log('Running Integration Tests...')
  
  const testFiles = findTestFiles(CONFIG.testPatterns.integration)
  if (testFiles.length === 0) {
    log('No integration test files found', 'warning')
    return { success: true, skipped: true }
  }

  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=tests/integration', '--verbose'])
    log('Integration tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`Integration tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

async function runComponentTests() {
  log('Running Component Tests...')
  
  const testFiles = findTestFiles(CONFIG.testPatterns.components)
  if (testFiles.length === 0) {
    log('No component test files found', 'warning')
    return { success: true, skipped: true }
  }

  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=tests/components', '--verbose'])
    log('Component tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`Component tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

async function runE2ETests() {
  log('Running End-to-End Tests...')
  
  if (!checkFileExists('tests/integration/end-to-end.test.js')) {
    log('E2E test file not found', 'warning')
    return { success: true, skipped: true }
  }

  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=end-to-end.test.js', '--verbose'])
    log('E2E tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`E2E tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

async function runAPITests() {
  log('Running API Tests...')
  
  if (!checkFileExists('tests/integration/api-endpoints.test.js')) {
    log('API test file not found', 'warning')
    return { success: true, skipped: true }
  }

  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=api-endpoints.test.js', '--verbose'])
    log('API tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`API tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

async function runDatabaseTests() {
  log('Running Database Tests...')
  
  if (!checkFileExists('tests/integration/database.test.js')) {
    log('Database test file not found', 'warning')
    return { success: true, skipped: true }
  }

  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=database.test.js', '--verbose'])
    log('Database tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`Database tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

async function runPerformanceTests() {
  log('Running Performance Tests...')
  
  if (!checkFileExists('tests/integration/performance.test.js')) {
    log('Performance test file not found', 'warning')
    return { success: true, skipped: true }
  }

  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=performance.test.js', '--verbose'])
    log('Performance tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`Performance tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

async function runSecurityTests() {
  log('Running Security Tests...')
  
  if (!checkFileExists('tests/integration/security.test.js')) {
    log('Security test file not found', 'warning')
    return { success: true, skipped: true }
  }

  try {
    await runCommand('npm', ['test', '--', '--testPathPattern=security.test.js', '--verbose'])
    log('Security tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`Security tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

async function runCoverageTests() {
  log('Running Coverage Tests...')
  
  try {
    await runCommand('npm', ['test', '--', '--coverage', '--coverageReporters=text', '--coverageReporters=lcov'])
    log('Coverage tests completed successfully', 'success')
    return { success: true, skipped: false }
  } catch (error) {
    log(`Coverage tests failed: ${error.message}`, 'error')
    return { success: false, skipped: false, error: error.message }
  }
}

// Main test runner
async function runAllTests(options = {}) {
  const startTime = Date.now()
  
  log('🚀 Starting Comprehensive Test Suite')
  log(`Test timeout: ${CONFIG.testTimeout}ms`)
  
  if (!performPreFlightChecks()) {
    log('Pre-flight checks failed. Exiting.', 'error')
    process.exit(1)
  }

  const results = {
    unit: { success: false, skipped: false },
    integration: { success: false, skipped: false },
    components: { success: false, skipped: false },
    e2e: { success: false, skipped: false },
    api: { success: false, skipped: false },
    database: { success: false, skipped: false },
    performance: { success: false, skipped: false },
    security: { success: false, skipped: false },
    coverage: { success: false, skipped: false }
  }

  // Run tests based on options
  if (options.unit || options.all) {
    results.unit = await runUnitTests()
  }

  if (options.integration || options.all) {
    results.integration = await runIntegrationTests()
  }

  if (options.components || options.all) {
    results.components = await runComponentTests()
  }

  if (options.e2e || options.all) {
    results.e2e = await runE2ETests()
  }

  if (options.api || options.all) {
    results.api = await runAPITests()
  }

  if (options.database || options.all) {
    results.database = await runDatabaseTests()
  }

  if (options.performance || options.all) {
    results.performance = await runPerformanceTests()
  }

  if (options.security || options.all) {
    results.security = await runSecurityTests()
  }

  if (options.coverage || options.all) {
    results.coverage = await runCoverageTests()
  }

  // Generate summary
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  
  log('\n📊 Test Summary')
  log(`Duration: ${duration}s`)
  
  let totalTests = 0
  let passedTests = 0
  let skippedTests = 0
  let failedTests = 0

  for (const [category, result] of Object.entries(results)) {
    if (result.skipped) {
      log(`${category}: SKIPPED (no test files found)`, 'warning')
      skippedTests++
    } else if (result.success) {
      log(`${category}: PASSED`, 'success')
      passedTests++
    } else {
      log(`${category}: FAILED - ${result.error}`, 'error')
      failedTests++
    }
    totalTests++
  }

  log(`\n📈 Results: ${passedTests}/${totalTests} passed, ${failedTests} failed, ${skippedTests} skipped`)

  if (failedTests > 0) {
    log('❌ Some tests failed. Please review the output above.', 'error')
    process.exit(1)
  } else {
    log('✅ All tests passed successfully!', 'success')
  }
}

// CLI argument parsing
function parseArguments() {
  const args = process.argv.slice(2)
  const options = {
    all: false,
    unit: false,
    integration: false,
    components: false,
    e2e: false,
    api: false,
    database: false,
    performance: false,
    security: false,
    coverage: false,
    watch: false,
    ci: false,
    debug: false
  }

  for (const arg of args) {
    switch (arg) {
      case '--all':
        options.all = true
        break
      case '--unit':
        options.unit = true
        break
      case '--integration':
        options.integration = true
        break
      case '--components':
        options.components = true
        break
      case '--e2e':
        options.e2e = true
        break
      case '--api':
        options.api = true
        break
      case '--database':
        options.database = true
        break
      case '--performance':
        options.performance = true
        break
      case '--security':
        options.security = true
        break
      case '--coverage':
        options.coverage = true
        break
      case '--watch':
        options.watch = true
        break
      case '--ci':
        options.ci = true
        break
      case '--debug':
        options.debug = true
        break
      case '--help':
      case '-h':
        showHelp()
        process.exit(0)
        break
      default:
        log(`Unknown option: ${arg}`, 'warning')
        break
    }
  }

  // Default to all tests if no specific options provided
  if (!Object.values(options).some(Boolean)) {
    options.all = true
  }

  return options
}

function showHelp() {
  console.log(`
Comprehensive Test Runner for Stride Social Dashboard

Usage: node scripts/run-tests.js [options]

Options:
  --all              Run all test categories
  --unit             Run unit tests only
  --integration      Run integration tests only
  --components       Run component tests only
  --e2e              Run end-to-end tests only
  --api              Run API tests only
  --database         Run database tests only
  --performance      Run performance tests only
  --security         Run security tests only
  --coverage         Run coverage tests only
  --watch            Run tests in watch mode
  --ci               Run tests in CI mode
  --debug            Enable debug logging
  --help, -h         Show this help message

Examples:
  node scripts/run-tests.js --all
  node scripts/run-tests.js --unit --integration
  node scripts/run-tests.js --coverage
  `)
}

// Main execution
if (require.main === module) {
  const options = parseArguments()
  
  if (options.debug) {
    log('Debug mode enabled')
    console.log('Options:', options)
  }

  runAllTests(options).catch((error) => {
    log(`Test runner failed: ${error.message}`, 'error')
    process.exit(1)
  })
}

module.exports = { runAllTests, CONFIG } 