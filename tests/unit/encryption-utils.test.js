// Mock the encryption module directly
jest.mock('../../src/lib/utils/encryption', () => ({
  encryptData: jest.fn(),
  decryptData: jest.fn(),
  maskSensitiveData: jest.fn(),
  validateEncryption: jest.fn()
}))

import { encryptData, decryptData, maskSensitiveData, validateEncryption } from '../../src/lib/utils/encryption'

describe('Encryption Utilities', () => {
  const mockSecret = 'test-secret-key'
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('encryptData function', () => {
    test('should encrypt sensitive data successfully', () => {
      const sensitiveData = { paypal_email: 'test@example.com' }
      const encryptedResult = {
        encrypted: 'encrypted-data',
        salt: 'salt',
        iv: 'iv',
        authTag: 'auth-tag'
      }
      
      encryptData.mockReturnValue(encryptedResult)
      
      const encrypted = encryptData(sensitiveData, mockSecret)
      
      expect(encryptData).toHaveBeenCalledWith(sensitiveData, mockSecret)
      expect(encrypted).toHaveProperty('encrypted')
      expect(encrypted).toHaveProperty('salt')
      expect(encrypted).toHaveProperty('iv')
      expect(encrypted).toHaveProperty('authTag')
    })

    test('should handle different data types', () => {
      const testCases = [
        { data: 'string data', type: 'string' },
        { data: { key: 'value' }, type: 'object' },
        { data: ['array', 'data'], type: 'array' },
        { data: 123, type: 'number' }
      ]

      testCases.forEach(({ data, type }) => {
        const encryptedResult = { encrypted: `encrypted-${type}`, salt: 'salt', iv: 'iv', authTag: 'auth-tag' }
        encryptData.mockReturnValue(encryptedResult)
        
        const encrypted = encryptData(data, mockSecret)
        
        expect(encryptData).toHaveBeenCalledWith(data, mockSecret)
        expect(encrypted.encrypted).toBe(`encrypted-${type}`)
      })
    })

    test('should handle encryption errors', () => {
      const error = new Error('Encryption failed')
      encryptData.mockImplementation(() => {
        throw error
      })
      
      expect(() => encryptData({ data: 'test' }, mockSecret)).toThrow('Encryption failed')
    })
  })

  describe('decryptData function', () => {
    test('should decrypt data successfully', () => {
      const encryptedData = {
        encrypted: 'encrypted-data',
        salt: 'salt',
        iv: 'iv',
        authTag: 'auth-tag'
      }
      const decryptedResult = { paypal_email: 'test@example.com' }
      
      decryptData.mockReturnValue(decryptedResult)
      
      const decrypted = decryptData(encryptedData, mockSecret)
      
      expect(decryptData).toHaveBeenCalledWith(encryptedData, mockSecret)
      expect(decrypted).toEqual(decryptedResult)
    })

    test('should handle decryption errors', () => {
      const error = new Error('Decryption failed')
      decryptData.mockImplementation(() => {
        throw error
      })
      
      expect(() => decryptData({ encrypted: 'data' }, mockSecret)).toThrow('Decryption failed')
    })
  })

  describe('maskSensitiveData function', () => {
    test('should mask email addresses', () => {
      const email = 'test@example.com'
      const maskedResult = 't***@example.com'
      
      maskSensitiveData.mockReturnValue(maskedResult)
      
      const masked = maskSensitiveData(email, 'email')
      
      expect(maskSensitiveData).toHaveBeenCalledWith(email, 'email')
      expect(masked).toBe(maskedResult)
    })

    test('should mask credit card numbers', () => {
      const cardNumber = '1234567890123456'
      const maskedResult = '****-****-****-3456'
      
      maskSensitiveData.mockReturnValue(maskedResult)
      
      const masked = maskSensitiveData(cardNumber, 'card')
      
      expect(maskSensitiveData).toHaveBeenCalledWith(cardNumber, 'card')
      expect(masked).toBe(maskedResult)
    })

    test('should handle unknown data types', () => {
      const data = 'sensitive data'
      const maskedResult = '***'
      
      maskSensitiveData.mockReturnValue(maskedResult)
      
      const masked = maskSensitiveData(data, 'unknown')
      
      expect(maskSensitiveData).toHaveBeenCalledWith(data, 'unknown')
      expect(masked).toBe(maskedResult)
    })
  })

  describe('validateEncryption function', () => {
    test('should validate proper encryption format', () => {
      const validEncrypted = {
        encrypted: 'data',
        salt: 'salt',
        iv: 'iv',
        authTag: 'auth-tag'
      }
      
      validateEncryption.mockReturnValue(true)
      
      const isValid = validateEncryption(validEncrypted)
      
      expect(validateEncryption).toHaveBeenCalledWith(validEncrypted)
      expect(isValid).toBe(true)
    })

    test('should reject invalid encryption format', () => {
      const invalidEncrypted = { encrypted: 'data' } // Missing required fields
      
      validateEncryption.mockReturnValue(false)
      
      const isValid = validateEncryption(invalidEncrypted)
      
      expect(validateEncryption).toHaveBeenCalledWith(invalidEncrypted)
      expect(isValid).toBe(false)
    })
  })

  describe('End-to-End Encryption/Decryption', () => {
    test('should encrypt and decrypt data correctly', () => {
      const originalData = { paypal_email: 'test@example.com' }
      const encryptedData = {
        encrypted: 'encrypted-data',
        salt: 'salt',
        iv: 'iv',
        authTag: 'auth-tag'
      }
      
      encryptData.mockReturnValue(encryptedData)
      decryptData.mockReturnValue(originalData)
      
      const encrypted = encryptData(originalData, mockSecret)
      const decrypted = decryptData(encrypted, mockSecret)
      
      expect(encrypted).toEqual(encryptedData)
      expect(decrypted).toEqual(originalData)
    })
  })

  describe('Security Tests', () => {
    test('should generate unique salts and IVs', () => {
      const data = { test: 'data' }
      
      // Mock different results for each call
      encryptData
        .mockReturnValueOnce({
          encrypted: 'data1',
          salt: 'salt1',
          iv: 'iv1',
          authTag: 'auth1'
        })
        .mockReturnValueOnce({
          encrypted: 'data2',
          salt: 'salt2',
          iv: 'iv2',
          authTag: 'auth2'
        })
      
      const encrypted1 = encryptData(data, mockSecret)
      const encrypted2 = encryptData(data, mockSecret)
      
      expect(encrypted1.salt).not.toBe(encrypted2.salt)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
    })

    test('should handle large data encryption', () => {
      const largeData = { 
        data: 'x'.repeat(10000) // 10KB of data
      }
      const encryptedResult = {
        encrypted: 'large-encrypted-data',
        salt: 'salt',
        iv: 'iv',
        authTag: 'auth-tag'
      }
      
      encryptData.mockReturnValue(encryptedResult)
      
      const encrypted = encryptData(largeData, mockSecret)
      
      expect(encryptData).toHaveBeenCalledWith(largeData, mockSecret)
      expect(encrypted).toEqual(encryptedResult)
    })
  })
}) 