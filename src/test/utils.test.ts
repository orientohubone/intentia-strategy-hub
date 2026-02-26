import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('c-1', 'c-2')).toBe('c-1 c-2');
  });

  it('should handle conditional classes', () => {
    expect(cn('c-1', true && 'c-2', false && 'c-3')).toBe('c-1 c-2');
  });

  it('should handle object inputs', () => {
    expect(cn({ 'c-1': true, 'c-2': false, 'c-3': true })).toBe('c-1 c-3');
  });

  it('should handle array inputs', () => {
    expect(cn(['c-1', 'c-2'])).toBe('c-1 c-2');
  });

  it('should handle mixed inputs', () => {
    expect(cn('c-1', ['c-2'], { 'c-3': true })).toBe('c-1 c-2 c-3');
  });

  it('should merge tailwind classes correctly (last wins)', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle edge cases (null, undefined, boolean)', () => {
    expect(cn(null, undefined, false, 'c-1')).toBe('c-1');
  });

  it('should handle empty inputs', () => {
      expect(cn()).toBe('');
  });
});
