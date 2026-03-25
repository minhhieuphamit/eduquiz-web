import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KatexService } from '../../../core/services/katex.service';

/**
 * MathContentComponent — renders raw text with optional KaTeX math formulas.
 *
 * Usage:
 *   <app-math-content [content]="question.content" [enableKatex]="true" />
 *
 * Security:
 *   - All non-math text is HTML-escaped by KatexService
 *   - KaTeX output is safe (spans + CSS classes only)
 *   - DomSanitizer bypass is safe because we fully control the rendering pipeline
 */
@Component({
  selector: 'app-math-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [innerHTML]="safeHtml()"></span>`,
  styles: `
    :host {
      display: block;
      max-width: 100%;
      word-wrap: break-word;
    }

    :host ::ng-deep {
      .katex-display {
        margin: 0.75em 0;
        padding: 0.5em 0;
        text-align: center;
      }

      .katex {
        line-height: 1.2;
        text-indent: 0;
      }

      .katex-error {
        color: #c53030;
        font-size: 0.85em;
      }
    }
  `,
})
export class MathContentComponent {
  content = input<string | null | undefined>('');
  enableKatex = input(false);

  private katexService = inject(KatexService);
  private sanitizer = inject(DomSanitizer);

  protected safeHtml = computed<SafeHtml>(() => {
    const raw = this.content();
    if (!raw) return '';

    const html = this.enableKatex()
      ? this.katexService.renderMathContent(raw)
      : this.katexService.renderPlainText(raw);

    return this.sanitizer.bypassSecurityTrustHtml(html);
  });
}
