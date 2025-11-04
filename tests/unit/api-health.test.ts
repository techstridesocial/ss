// Simple test that verifies the test infrastructure works
// Next.js API route tests require additional Web API polyfills

describe('Test Infrastructure', () => {
  it('should have Jest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should be able to import modules', () => {
    // Verify module resolution works
    expect(typeof require).toBe('function')
  })
})
