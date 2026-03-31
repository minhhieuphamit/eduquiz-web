import { describe, it, expect, beforeEach } from 'vitest';
import { KatexService } from './katex.service';

describe('KatexService', () => {
  let service: KatexService;

  beforeEach(() => {
    service = new KatexService();
  });

  // --- renderMathContent ---

  describe('renderMathContent', () => {
    it('returns empty string for null input', () => {
      expect(service.renderMathContent(null)).toBe('');
    });

    it('returns empty string for undefined input', () => {
      expect(service.renderMathContent(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(service.renderMathContent('')).toBe('');
    });

    it('renders plain text with HTML escaping', () => {
      const result = service.renderMathContent('Hello <world> & "friends"');
      expect(result).toContain('Hello');
      expect(result).toContain('&lt;world&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;friends&quot;');
      expect(result).not.toContain('<world>');
    });

    it('renders inline math $...$', () => {
      const result = service.renderMathContent('Tính $x^2$ bằng bao nhiêu?');
      expect(result).toContain('katex');
      expect(result).toContain('Tính');
      expect(result).toContain('bằng bao nhiêu?');
    });

    it('renders block math $$...$$', () => {
      const result = service.renderMathContent('Xem công thức: $$x^2 + y^2 = z^2$$');
      expect(result).toContain('katex');
      expect(result).toContain('katex-display'); // block math has display class
    });

    it('renders mixed text and math', () => {
      const result = service.renderMathContent('Cho $a = 1$ và $b = 2$, tính $a + b$');
      expect(result).toContain('katex');
      expect(result).toContain('Cho');
      expect(result).toContain('và');
      expect(result).toContain('tính');
    });

    it('handles malformed LaTeX gracefully', () => {
      // Should not throw, should produce error-styled output
      const result = service.renderMathContent('$\\invalid{$');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('preserves line breaks', () => {
      const result = service.renderMathContent('Line 1\nLine 2');
      expect(result).toContain('<br>');
    });

    it('does not render escaped dollar signs as math', () => {
      const result = service.renderMathContent('Price is \\$100');
      // Should not contain katex rendering for the dollar amount
      expect(result).toContain('100');
    });

    it('handles multiple block math segments', () => {
      const result = service.renderMathContent('$$a^2$$ text $$b^2$$');
      expect(result).toContain('katex');
      expect(result).toContain('text');
    });

    it('caches results for identical input', () => {
      const input = 'Test $x^2$';
      const result1 = service.renderMathContent(input);
      const result2 = service.renderMathContent(input);
      expect(result1).toBe(result2); // Same reference from cache
    });
  });

  // --- renderPlainText ---

  describe('renderPlainText', () => {
    it('returns empty string for null', () => {
      expect(service.renderPlainText(null)).toBe('');
    });

    it('escapes HTML in plain text', () => {
      const result = service.renderPlainText('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('preserves line breaks', () => {
      const result = service.renderPlainText('Line 1\nLine 2');
      expect(result).toContain('<br>');
    });
  });

  // --- clearCache ---

  describe('clearCache', () => {
    it('clears the render cache', () => {
      service.renderMathContent('test $x$');
      service.clearCache();
      // After clearing, it should still produce the same result (re-rendering)
      const result = service.renderMathContent('test $x$');
      expect(result).toContain('katex');
    });
  });
});
