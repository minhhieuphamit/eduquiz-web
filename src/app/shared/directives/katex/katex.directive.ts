/**
 * KaTeX Directive - Render LaTeX formulas.
 *
 * Usage: <p [appKatex]="questionContent"></p>
 *
 * Flow:
 * 1. Nhận string chứa LaTeX
 * 2. Detect patterns: $$...$$ (block) và $...$ (inline)
 * 3. Thay thế bằng KaTeX rendered HTML
 * 4. Set innerHTML
 *
 * Dependencies: npm install katex @types/katex
 *
 * Ví dụ:
 *   Input:  "Tính $\\int_0^1 x^2 dx$ bằng bao nhiêu?"
 *   Output: "Tính <span class='katex'>...</span> bằng bao nhiêu?"
 *
 * TODO: Implement @Directive({ selector: '[appKatex]', standalone: true })
 */
export class KatexDirective {}
