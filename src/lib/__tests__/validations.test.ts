/**
 * Test suite for validation utilities
 */

import '@testing-library/jest-dom'
import {
  validateCPF,
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateCEP,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  validatePassword,
  validateURL,
  sanitizeString,
  validateTime,
  isTimeAfter,
} from '@/lib/validations'

describe('Validation Utilities', () => {
  describe('validateCPF', () => {
    test('should validate correct CPF', () => {
      expect(validateCPF('123.456.789-09')).toBe(true)
      expect(validateCPF('12345678909')).toBe(true)
    })

    test('should reject invalid CPF', () => {
      expect(validateCPF('123.456.789-10')).toBe(false)
      expect(validateCPF('11111111111')).toBe(false)
      expect(validateCPF('123')).toBe(false)
    })
  })

  describe('validateCNPJ', () => {
    test('should validate correct CNPJ', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true)
      expect(validateCNPJ('11222333000181')).toBe(true)
    })

    test('should reject invalid CNPJ', () => {
      expect(validateCNPJ('11.222.333/0001-82')).toBe(false)
      expect(validateCNPJ('11111111111111')).toBe(false)
      expect(validateCNPJ('123')).toBe(false)
    })
  })

  describe('validateEmail', () => {
    test('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true)
    })

    test('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    test('should validate correct phone numbers', () => {
      expect(validatePhone('1199999999')).toBe(true) // 10 digits
      expect(validatePhone('11999999999')).toBe(true) // 11 digits
      expect(validatePhone('(11) 99999-9999')).toBe(true)
    })

    test('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('123456789012')).toBe(false)
    })
  })

  describe('validateCEP', () => {
    test('should validate correct CEP', () => {
      expect(validateCEP('12345678')).toBe(true)
      expect(validateCEP('12345-678')).toBe(true)
    })

    test('should reject invalid CEP', () => {
      expect(validateCEP('123')).toBe(false)
      expect(validateCEP('123456789')).toBe(false)
    })
  })

  describe('formatCPF', () => {
    test('should format CPF correctly', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09')
    })
  })

  describe('formatCNPJ', () => {
    test('should format CNPJ correctly', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
    })
  })

  describe('formatPhone', () => {
    test('should format phone numbers correctly', () => {
      expect(formatPhone('1199999999')).toBe('(11) 9999-9999')
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
    })
  })

  describe('formatCEP', () => {
    test('should format CEP correctly', () => {
      expect(formatCEP('12345678')).toBe('12345-678')
    })
  })

  describe('validatePassword', () => {
    test('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123')).toBe(true)
      expect(validatePassword('MySecure@Pass1')).toBe(true)
    })

    test('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false)
      expect(validatePassword('weakpassword')).toBe(false)
      expect(validatePassword('WEAKPASSWORD')).toBe(false)
      expect(validatePassword('12345678')).toBe(false)
    })
  })

  describe('validateURL', () => {
    test('should validate correct URLs', () => {
      expect(validateURL('https://example.com')).toBe(true)
      expect(validateURL('http://test.org')).toBe(true)
    })

    test('should reject invalid URLs', () => {
      expect(validateURL('not-a-url')).toBe(false)
      expect(validateURL('ftp://invalid')).toBe(true) // FTP is still valid URL
    })
  })

  describe('sanitizeString', () => {
    test('should sanitize strings correctly', () => {
      expect(sanitizeString('  test  ')).toBe('test')
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script')
    })
  })

  describe('validateTime', () => {
    test('should validate correct time format', () => {
      expect(validateTime('09:30')).toBe(true)
      expect(validateTime('23:59')).toBe(true)
      expect(validateTime('00:00')).toBe(true)
    })

    test('should reject invalid time format', () => {
      expect(validateTime('25:00')).toBe(false)
      expect(validateTime('12:60')).toBe(false)
      expect(validateTime('invalid')).toBe(false)
    })
  })

  describe('isTimeAfter', () => {
    test('should compare times correctly', () => {
      expect(isTimeAfter('10:30', '09:30')).toBe(true)
      expect(isTimeAfter('09:30', '10:30')).toBe(false)
      expect(isTimeAfter('12:00', '12:00')).toBe(false)
    })
  })
})
