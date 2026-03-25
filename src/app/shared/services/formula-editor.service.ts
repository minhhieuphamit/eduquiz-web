import { Injectable, signal } from '@angular/core';

export interface FormulaTemplate {
  template: string; // The text to insert, e.g., "\frac{}{}"
  cursorOffset: number; // How many characters left from the end of the template to place the cursor. E.g., 1 for "\frac{}{}" puts it inside the first `{}`
  wrapSelection?: boolean; // If true, wrapping "a+b" with "\frac{}{}" will put "a+b" inside the first `{}`.
}

@Injectable({
  providedIn: 'root'
})
export class FormulaEditorService {
  /** The currently or most recently focused input/textarea */
  private activeElement = signal<HTMLInputElement | HTMLTextAreaElement | null>(null);

  /**
   * Called by the ActiveEditorDirective whenever an input gains focus or cursor changes.
   */
  setActiveElement(element: HTMLInputElement | HTMLTextAreaElement | null) {
    this.activeElement.set(element);
  }

  /**
   * Inserts a formula template into the active element at the current cursor position.
   * If text is selected and `wrapSelection` is true, it wraps the selection inside the formula.
   */
  insertFormula(formula: FormulaTemplate) {
    const el = this.activeElement();
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const currentVal = el.value;
    const hasSelection = start !== end;

    let newCursorPos: number;
    let textToInsert = formula.template;

    if (hasSelection && formula.wrapSelection) {
      const selectedText = currentVal.substring(start, end);
      // Determine where the main argument goes. Usually the curly braces right before the offset.
      // Example: "\frac{}{}" with offset 3 (end is `}` then `}` then `{`).
      // A simple approach is inserting the selected text exactly where the cursor would normally go.
      
      const insertPos = formula.template.length - formula.cursorOffset;
      textToInsert = formula.template.slice(0, insertPos) + selectedText + formula.template.slice(insertPos);
      
      // Cursor should be placed right after the inserted text to continue typing,
      // or at the designated offset relative to the original template end.
      newCursorPos = start + insertPos + selectedText.length;
    } else {
      newCursorPos = start + formula.template.length - formula.cursorOffset;
    }

    // Insert the text
    const newValue = currentVal.substring(0, start) + textToInsert + currentVal.substring(end);
    
    // Update the DOM element
    el.value = newValue;
    
    // Dispatch input event so Angular Reactive Forms / ngModel picks up the change natively
    el.dispatchEvent(new Event('input', { bubbles: true }));

    // Restore focus and cursor position
    el.focus();
    el.setSelectionRange(newCursorPos, newCursorPos);
  }
}
