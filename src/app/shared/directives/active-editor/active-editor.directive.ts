import { Directive, ElementRef, inject } from '@angular/core';
import { FormulaEditorService } from '../../services/formula-editor.service';

/**
 * Applies to inputs and textareas.
 * Tracks when the element receives focus or cursor selection changes,
 * so the FormulaToolbar knows where to insert LaTeX macros.
 */
@Directive({
  selector: 'input[appActiveEditor], textarea[appActiveEditor]',
  host: {
    '(focus)': 'onFocus()',
    '(mouseup)': 'onSelectionChange()',
    '(keyup)': 'onSelectionChange()'
  }
})
export class ActiveEditorDirective {
  private el = inject(ElementRef<HTMLInputElement | HTMLTextAreaElement>);
  private formulaEditorService = inject(FormulaEditorService);

  onFocus() {
    this.formulaEditorService.setActiveElement(this.el.nativeElement);
  }

  onSelectionChange() {
    // If the user clicks or uses arrow keys to change selection, make sure this is the active element
    if (document.activeElement === this.el.nativeElement) {
      this.formulaEditorService.setActiveElement(this.el.nativeElement);
    }
  }
}
