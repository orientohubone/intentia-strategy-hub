import { describe, it, expect } from 'vitest';
import { formatCnpj } from '@/lib/adminAuth';

describe('adminAuth', () => {
  describe('formatCnpj', () => {
    it('should format a full 14-digit CNPJ correctly', () => {
      expect(formatCnpj('12345678000195')).toBe('12.345.678/0001-95');
    });

    it('should handle non-digit characters by stripping them', () => {
      expect(formatCnpj('12.345.678/0001-95')).toBe('12.345.678/0001-95');
      expect(formatCnpj('12a34b56c78d00e01f95')).toBe('12.345.678/0001-95');
    });

    it('should format partial CNPJ correctly', () => {
       expect(formatCnpj('12')).toBe('12');
       expect(formatCnpj('12345')).toBe('12.345');
       expect(formatCnpj('12345678')).toBe('12.345.678');
       expect(formatCnpj('123456780001')).toBe('12.345.678/0001');
    });

    it('should handle empty string', () => {
        expect(formatCnpj('')).toBe('');
    });

    it('should truncate input longer than 14 digits', () => {
        expect(formatCnpj('12345678000195999')).toBe('12.345.678/0001-95');
    });
  });
});
