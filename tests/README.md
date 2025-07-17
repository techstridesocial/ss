# Brand Portal Test Suite

This directory contains comprehensive automated tests for the Stride Social brand portal functionality.

## 🧪 Test Structure

### Test Files
- **`brand-portal.test.js`** - Unit and component tests for individual features
- **`integration/brand-workflow.test.js`** - End-to-end integration tests
- **`setup.js`** - Global test configuration and mocks
- **`__mocks__/fileMock.js`** - Mock for static assets

### Test Coverage
The test suite covers all major brand portal functionality:

- ✅ **Authentication & Access Control**
- ✅ **Brand Profile Management** (including logo upload)
- ✅ **Advanced Filtering System** (all 6 filter types)
- ✅ **Shortlist Management** (add, remove, persist)
- ✅ **Campaign & Quotation Workflow**
- ✅ **Detail Panel Integration**
- ✅ **Cross-Feature Integration**
- ✅ **Error Handling & Edge Cases**
- ✅ **Performance Testing**

## 🚀 Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Brand Portal Tests Only
```bash
npm run test:brand
```

### Run Integration Tests
```bash
npm run test:integration
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## 📊 Test Categories

### Unit Tests (`brand-portal.test.js`)
Tests individual components and features in isolation:

- **Authentication**: Role-based access, navigation rendering
- **Profile Management**: Edit mode, logo upload, form validation
- **Filtering**: Search, filter combinations, sort, pagination
- **Shortlist**: Add/remove influencers, state persistence
- **Campaigns**: Form validation, submission workflow
- **Detail Panel**: Open/close, platform switching, interactions

### Integration Tests (`integration/brand-workflow.test.js`)
Tests complete user workflows across multiple components:

- **Complete Discovery Workflow**: Filter → View → Shortlist → Campaign
- **State Persistence**: Data maintained across navigation
- **Complex Filter Combinations**: Multiple filters applied together
- **Error Recovery**: Network failures and recovery
- **Performance**: Large dataset handling

## 🔧 Test Configuration

### Jest Configuration
- **Environment**: jsdom (browser-like environment)
- **Setup Files**: Global mocks and configuration
- **Coverage**: Source files in `src/` directory
- **Timeout**: 10 seconds for async operations

### Mocks and Utilities
- **Next.js Navigation**: Router, search params, pathname
- **Clerk Authentication**: User state, auth methods
- **Fetch API**: API responses and error scenarios
- **localStorage**: State persistence testing
- **FileReader**: Logo upload functionality

## 📝 Test Data

### Mock Influencers
The tests use realistic mock data:
```javascript
{
  id: 'inf_fashion_1',
  display_name: 'Sarah Fashion UK',
  niches: ['Fashion', 'Lifestyle'],
  total_followers: 125000,
  total_engagement_rate: 0.038,
  location_country: 'United Kingdom',
  platforms: ['INSTAGRAM'],
  content_type: 'STANDARD'
}
```

### Test Scenarios
- **Fashion Influencer**: UK-based, Instagram, 125K followers
- **Beauty Expert**: UK-based, Instagram + TikTok, 87K followers, UGC content
- **Tech Reviewer**: US-based, YouTube, 156K followers

## 🎯 Key Test Scenarios

### Filter Testing
```javascript
// Apply multiple filters simultaneously
await user.selectOptions(nicheSelect, 'Beauty')
await user.selectOptions(locationSelect, 'United Kingdom')
await user.selectOptions(platformSelect, 'INSTAGRAM')

// Verify filtering works
expect(screen.getByText('Emma Beauty Expert')).toBeInTheDocument()
expect(screen.queryByText('Tech Mike Reviews')).not.toBeInTheDocument()
```

### Shortlist Testing
```javascript
// Add to shortlist
await user.click(heartButtons[0])

// Verify persistence
const shortlist = JSON.parse(localStorage.getItem('heartedInfluencers'))
expect(shortlist).toHaveLength(1)
expect(shortlist[0].displayName).toBe('Sarah Fashion UK')
```

### Campaign Workflow
```javascript
// Create campaign
await user.type(nameInput, 'Beauty & Fashion Collaboration')
await user.type(descInput, 'Campaign description...')
await user.click(submitButton)

// Verify success
expect(screen.getByText('Campaign submitted successfully!')).toBeInTheDocument()
```

## 🚨 Common Issues & Solutions

### Mock Errors
If you see "Cannot read property of undefined" errors:
- Check that all required mocks are in place
- Verify component props match expected interface
- Ensure async operations are properly awaited

### Test Timeouts
If tests timeout:
- Increase timeout in jest.config.js
- Use `waitFor` for async operations
- Check for infinite loops in useEffect hooks

### Component Rendering Issues
If components don't render:
- Verify TestWrapper includes all required providers
- Check that imports match actual file structure
- Ensure CSS modules are properly mocked

## 📈 Performance Benchmarks

The tests include performance checks:
- **Render Time**: Components should render in <2-3 seconds
- **Large Datasets**: Handle 200+ influencers efficiently
- **Filter Response**: Real-time filtering under 500ms

## 🔄 Continuous Integration

These tests are designed to run in CI/CD pipelines:
- **No external dependencies** (fully mocked)
- **Deterministic results** (consistent across environments)
- **Fast execution** (complete suite under 2 minutes)

## 📚 Adding New Tests

When adding new features, include tests for:
1. **Happy path** - feature works as expected
2. **Error handling** - graceful failure modes
3. **Edge cases** - boundary conditions
4. **Integration** - works with existing features
5. **Performance** - acceptable response times

### Example Test Structure
```javascript
describe('New Feature', () => {
  test('should work correctly', async () => {
    const user = userEvent.setup()
    
    render(<TestWrapper><Component /></TestWrapper>)
    
    // Arrange
    await waitFor(() => {
      expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })
    
    // Act
    await user.click(screen.getByRole('button'))
    
    // Assert
    expect(/* expected outcome */).toBeTruthy()
  })
})
```

## 🎉 Test Results

When all tests pass, you should see:
```
 PASS  tests/brand-portal.test.js
 PASS  tests/integration/brand-workflow.test.js

Test Suites: 2 passed, 2 total
Tests:       25+ passed, 25+ total
Snapshots:   0 total
Time:        45.234 s
```

This confirms that all brand portal functionality is working correctly! 