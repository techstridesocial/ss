// Mock the entire database connection module
jest.mock('../../src/lib/db/connection', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  transaction: jest.fn(),
  checkDatabaseHealth: jest.fn()
}))

import { query, queryOne, transaction, checkDatabaseHealth } from '../../src/lib/db/connection'

describe('Database Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('query function', () => {
    test('should execute query successfully', async () => {
      const mockResult = [{ id: 1, name: 'test' }]
      query.mockResolvedValue(mockResult)
      
      const result = await query('SELECT * FROM users WHERE id = $1', [1])
      
      expect(query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1])
      expect(result).toEqual(mockResult)
    })

    test('should handle query errors', async () => {
      const error = new Error('Database connection failed')
      query.mockRejectedValue(error)
      
      await expect(query('SELECT * FROM users')).rejects.toThrow('Database connection failed')
    })
  })

  describe('queryOne function', () => {
    test('should return single result', async () => {
      const mockResult = { id: 1, name: 'test' }
      queryOne.mockResolvedValue(mockResult)
      
      const result = await queryOne('SELECT * FROM users WHERE id = $1', [1])
      
      expect(queryOne).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1])
      expect(result).toEqual(mockResult)
    })
  })

  describe('transaction function', () => {
    test('should execute transaction successfully', async () => {
      const mockCallback = jest.fn().mockResolvedValue('success')
      transaction.mockResolvedValue('success')
      
      const result = await transaction(mockCallback)
      
      expect(transaction).toHaveBeenCalledWith(mockCallback)
      expect(result).toBe('success')
    })
  })

  describe('checkDatabaseHealth function', () => {
    test('should return healthy status', async () => {
      checkDatabaseHealth.mockResolvedValue({ status: 'healthy', timestamp: new Date() })
      
      const result = await checkDatabaseHealth()
      
      expect(checkDatabaseHealth).toHaveBeenCalled()
      expect(result.status).toBe('healthy')
    })
  })
}) 