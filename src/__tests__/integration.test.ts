/**
 * Comprehensive integration test for ComparAuto
 * Tests all major utilities and components
 */

import '@testing-library/jest-dom'
import {
  validateCPF,
  validateEmail,
  formatPhone,
  validatePassword,
  sanitizeString,
} from '@/lib/validations'
import { DataCache } from '@/lib/data-service'
import { AppError } from '@/lib/errors'

describe('ComparAuto Integration Tests', () => {
  describe('Validation System', () => {
    test('should validate Brazilian documents correctly', () => {
      // Valid CPF
      expect(validateCPF('123.456.789-09')).toBe(true)
      
      // Invalid CPF
      expect(validateCPF('123.456.789-10')).toBe(false)
      expect(validateCPF('111.111.111-11')).toBe(false)
    })

    test('should validate email formats', () => {
      expect(validateEmail('user@comparauto.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
    })

    test('should format phone numbers', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
      expect(formatPhone('1199999999')).toBe('(11) 9999-9999')
    })

    test('should validate password strength', () => {
      expect(validatePassword('StrongPass123')).toBe(true)
      expect(validatePassword('weak')).toBe(false)
    })
  })

  describe('Cache System', () => {
    let cache: DataCache

    beforeEach(() => {
      cache = new DataCache()
    })

    test('should store and retrieve data', () => {
      const testData = { id: 1, name: 'Test Oficina' }
      cache.set('test-key', testData)
      
      expect(cache.get('test-key')).toEqual(testData)
    })

    test('should handle TTL expiration', (done) => {
      const testData = { id: 1, name: 'Test Oficina' }
      cache.set('test-key', testData, 10) // 10ms TTL
      
      setTimeout(() => {
        expect(cache.get('test-key')).toBeNull()
        done()
      }, 20)
    })

    test('should clear cache', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      expect(cache.size()).toBe(2)
      
      cache.clear()
      expect(cache.size()).toBe(0)
    })
  })

  describe('Error Handling', () => {
    test('should create AppError instances', () => {
      const error = new AppError('Test error', 'VALIDATION_ERROR')
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('Environment Configuration', () => {
    test('should have required environment variables for testing', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-key')
      expect(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).toBe('test-maps-key')
    })
  })

  describe('Type Safety', () => {
    test('should handle TypeScript types correctly', () => {
      interface TestOficina {
        id: string
        nome: string
        status: 'ativo' | 'inativo'
      }

      const oficina: TestOficina = {
        id: '123',
        nome: 'Test Oficina',
        status: 'ativo'
      }

      expect(oficina.id).toBe('123')
      expect(oficina.nome).toBe('Test Oficina')
      expect(oficina.status).toBe('ativo')
    })
  })

  describe('Utility Functions', () => {
    test('should handle edge cases gracefully', () => {
      // Empty strings
      expect(validateEmail('')).toBe(false)
      expect(validateCPF('')).toBe(false)
      
      // Null/undefined protection
      expect(() => formatPhone('')).not.toThrow()
      expect(() => validatePassword('')).not.toThrow()
    })

    test('should sanitize inputs', () => {
      expect(sanitizeString('  test  ')).toBe('test')
      expect(sanitizeString('<script>alert("xss")</script>')).not.toContain('<script>')
    })
  })
})

// Performance test
describe('Performance Tests', () => {
  test('should handle large datasets efficiently', () => {
    const cache = new DataCache()
    const startTime = performance.now()
    
    // Add 1000 cache entries
    for (let i = 0; i < 1000; i++) {
      cache.set(`key-${i}`, { id: i, data: `test-${i}` })
    }
    
    // Retrieve all entries
    for (let i = 0; i < 1000; i++) {
      cache.get(`key-${i}`)
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Should complete within reasonable time (adjust as needed)
    expect(duration).toBeLessThan(100) // 100ms for 1000 operations
  })

  test('should validate CPF efficiently', () => {
    const startTime = performance.now()
    
    // Validate 100 CPFs
    for (let i = 0; i < 100; i++) {
      validateCPF('123.456.789-09')
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(50) // Should be very fast
  })
})
