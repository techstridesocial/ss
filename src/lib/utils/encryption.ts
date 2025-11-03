import crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32
const ITERATIONS = 100000

// Get encryption key from environment (in production, use a proper key management system)
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || 'default-secret-key-for-development-only'
  
  if (!process.env.ENCRYPTION_SECRET) {
    console.warn('⚠️  Using default encryption secret. Set ENCRYPTION_SECRET in production!')
  }
  
  // Derive a key from the secret using PBKDF2
  return crypto.pbkdf2Sync(secret, 'salt', ITERATIONS, KEY_LENGTH, 'sha256')
}

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const salt = crypto.randomBytes(SALT_LENGTH)
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    cipher.setAAD(salt)
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Get the auth tag
    const tag = cipher.getAuthTag()
    
    // Combine all components: salt + iv + tag + encrypted data
    const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')])
    
    return combined.toString('base64')
  } catch (_error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedData, 'base64')
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH)
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAAD(salt)
    decipher.setAuthTag(tag)
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (_error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Hash sensitive data (one-way encryption for passwords, etc.)
 */
export function hashData(data: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(data, generatedSalt, ITERATIONS, 64, 'sha512').toString('hex')
  
  return { hash, salt: generatedSalt }
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashData(data, salt)
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Mask sensitive data for display (e.g., credit card numbers)
 */
export function maskSensitiveData(data: string, type: 'email' | 'phone' | 'card' | 'bank' = 'card'): string {
  if (!data) return ''
  
  switch (type) {
    case 'email':
      const [local, domain] = data.split('@')
      if (!local || local.length <= 2) return data
      return `${local.substring(0, 2)}***@${domain}`
    
    case 'phone':
      if (data.length <= 4) return data
      return `${data.substring(0, 2)}***${data.substring(data.length - 2)}`
    
    case 'card':
      if (data.length <= 4) return data
      return `****${data.substring(data.length - 4)}`
    
    case 'bank':
      if (data.length <= 4) return data
      return `****${data.substring(data.length - 4)}`
    
    default:
      return data
  }
}

/**
 * Sanitize data for logging (remove sensitive information)
 */
export function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card', 'bank_account', 'ssn']
  const sanitized = { ...data }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

/**
 * Generate a secure password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(crypto.randomInt(charset.length))
  }
  
  return password
} 