import { Injectable } from '@angular/core';
import katex from 'katex';

/** Maximum cache entries to prevent unbounded memory growth. */
const MAX_CACHE_SIZE = 500;

/**
 * KatexService — renders raw text containing LaTeX math into safe HTML.
 *
 * Rendering strategy:
 * 1. Extract $$...$$ (block math) first — supports multiline content (matrices, aligned, etc.)
 * 2. Extract $...$ (inline math) — single-line, non-empty
 * 3. HTML-escape all remaining non-math text (prevent XSS)
 * 4. Restore math segments and preserve line breaks
 *
 * Security:
 * - Non-math text is HTML-escaped → no XSS from user content
 * - KaTeX output is safe by design (spans + classes, no script execution)
 */
@Injectable({ providedIn: 'root' })
export class KatexService {
  private cache = new Map<string, string>();

  /**
   * Renders raw text containing LaTeX math into safe HTML.
   * Returns empty string for null/undefined/empty input.
   */
  renderMathContent(raw: string | null | undefined): string {
    if (!raw) return '';

    const cached = this.cache.get(raw);
    if (cached !== undefined) return cached;

    const result = this.parse(raw);
    this.setCacheEntry(raw, result);
    return result;
  }

  /** Renders plain text with HTML escaping and line-break preservation. */
  renderPlainText(raw: string | null | undefined): string {
    if (!raw) return '';
    return this.escapeHtml(raw).replace(/\n/g, '<br>');
  }

  /** Clears the render cache. */
  clearCache(): void {
    this.cache.clear();
  }

  private parse(raw: string): string {
    const mathSegments: string[] = [];
    let tokenized = raw;

    // Step 1: Extract block math $$...$$ (supports multiline for matrices/aligned)
    // [\s\S]+? matches any character including newlines (non-greedy)
    tokenized = tokenized.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => {
      const rendered = this.renderKatex(tex.trim(), true);
      const idx = mathSegments.length;
      mathSegments.push(rendered);
      return `\x00MATH${idx}\x00`;
    });

    // Step 2: Extract inline math $...$
    // Negative lookbehind for \ to skip escaped dollar signs
    // Content must not be empty and must not contain newlines (inline only)
    tokenized = tokenized.replace(/(?<!\\)\$([^\n$]+?)\$/g, (_, tex: string) => {
      const rendered = this.renderKatex(tex.trim(), false);
      const idx = mathSegments.length;
      mathSegments.push(rendered);
      return `\x00MATH${idx}\x00`;
    });

    // Step 3: HTML-escape remaining non-math text
    tokenized = this.escapeHtml(tokenized);

    // Step 4: Preserve line breaks in non-math text BEFORE restoring
    // math segments — KaTeX HTML may contain newlines in SVG paths
    // that must not be replaced with <br>
    tokenized = tokenized.replace(/\n/g, '<br>');

    // Step 5: Restore math segments (already safe HTML from KaTeX)
    tokenized = tokenized.replace(/\x00MATH(\d+)\x00/g, (_, idxStr: string) => {
      return mathSegments[parseInt(idxStr, 10)];
    });

    return tokenized;
  }

  private renderKatex(tex: string, displayMode: boolean): string {
    try {
      return katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: false,
      });
    } catch {
      return `<span class="katex-error" style="color:#c53030;">${this.escapeHtml(tex)}</span>`;
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private setCacheEntry(key: string, value: string): void {
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}
