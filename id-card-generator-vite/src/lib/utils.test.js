import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge Tailwind classes with proper precedence', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  // Property-based test example
  it('should always return a string', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(fc.string(), fc.constant(false), fc.constant(null), fc.constant(undefined))),
        (classes) => {
          const result = cn(...classes);
          expect(typeof result).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});
