import { describe, it, expect } from 'vitest';
import { shouldEnableFormulaTools } from './subject-katex.util';

describe('shouldEnableFormulaTools', () => {
  // STEM subjects — should enable KaTeX
  it.each([
    'Toán',
    'Vật lí',
    'Hóa học',
    'Sinh học',
  ])('returns true for STEM subject "%s"', (name) => {
    expect(shouldEnableFormulaTools(name)).toBe(true);
  });

  // Case-insensitive
  it.each([
    'toán',
    'TOÁN',
    'VẬT LÍ',
    'hóa HỌC',
  ])('is case-insensitive: "%s"', (name) => {
    expect(shouldEnableFormulaTools(name)).toBe(true);
  });

  // Trim whitespace
  it('trims whitespace from subject name', () => {
    expect(shouldEnableFormulaTools('  Toán  ')).toBe(true);
    expect(shouldEnableFormulaTools(' Vật lí ')).toBe(true);
  });

  // Social-science subjects — should NOT enable KaTeX
  it.each([
    'Ngữ văn',
    'Lịch sử',
    'Địa lý',
    'Giáo dục công dân',
    'Tiếng Anh',
    'Tin học',
  ])('returns false for non-STEM subject "%s"', (name) => {
    expect(shouldEnableFormulaTools(name)).toBe(false);
  });

  // Edge cases
  it('returns false for null', () => {
    expect(shouldEnableFormulaTools(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(shouldEnableFormulaTools(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(shouldEnableFormulaTools('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(shouldEnableFormulaTools('   ')).toBe(false);
  });
});
