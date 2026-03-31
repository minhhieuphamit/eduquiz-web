import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormulaEditorService, FormulaTemplate } from '../../services/formula-editor.service';
import { MathContentComponent } from '../math-content/math-content.component';

interface FormulaItem {
  label: string;
  tooltip: string;
  tpl: FormulaTemplate;
  isText?: boolean;
}

interface FormulaGroup {
  name: string;
  items: FormulaItem[];
}

@Component({
  selector: 'app-formula-toolbar',
  imports: [MathContentComponent],
  templateUrl: './formula-toolbar.component.html',
  styleUrls: ['./formula-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormulaToolbarComponent {
  private formulaService = inject(FormulaEditorService);

  activeTab = signal<number>(0);

  readonly groups: FormulaGroup[] = [
    {
      name: 'Cơ bản',
      items: [
        { label: 'Thêm $...$', isText: true, tooltip: 'Công thức trên dòng (Inline)', tpl: { template: '$ $', cursorOffset: 1, wrapSelection: true } },
        { label: 'Thêm $$...$$', isText: true, tooltip: 'Công thức khối (Block)', tpl: { template: '$$\n\n$$', cursorOffset: 3, wrapSelection: true } },
        { label: '$\\frac{a}{b}$', tooltip: 'Phân số', tpl: { template: '\\frac{}{}', cursorOffset: 3, wrapSelection: true } },
        { label: '$\\sqrt{x}$', tooltip: 'Căn bậc 2', tpl: { template: '\\sqrt{}', cursorOffset: 1, wrapSelection: true } },
        { label: '$(x)$', tooltip: 'Ngoặc tròn', tpl: { template: '\\left(  \\right)', cursorOffset: 8, wrapSelection: true } },
        { label: '$[x]$', tooltip: 'Ngoặc vuông', tpl: { template: '\\left[  \\right]', cursorOffset: 8, wrapSelection: true } },
      ]
    },
    {
      name: 'Đại số',
      items: [
        { label: '$x^n$', tooltip: 'Số mũ/Lũy thừa', tpl: { template: '^{}', cursorOffset: 1, wrapSelection: true } },
        { label: '$x_n$', tooltip: 'Chỉ số dưới', tpl: { template: '_{}', cursorOffset: 1, wrapSelection: true } },
        { label: '$\\sqrt[n]{x}$', tooltip: 'Căn bậc n', tpl: { template: '\\sqrt[]{}', cursorOffset: 3, wrapSelection: false } },
        { label: '$\\log_a x$', tooltip: 'Logarit', tpl: { template: '\\log_{}', cursorOffset: 5, wrapSelection: true } },
        { label: '$\\vec{v}$', tooltip: 'Vector', tpl: { template: '\\vec{}', cursorOffset: 1, wrapSelection: true } },
        { label: '$\\dots$', tooltip: 'Dấu ba chấm', tpl: { template: '\\dots', cursorOffset: 0 } },
      ]
    },
    {
      name: 'Giải tích',
      items: [
        { label: '$\\int$', tooltip: 'Tích phân', tpl: { template: '\\int_{}^{}  dx', cursorOffset: 7, wrapSelection: false } },
        { label: '$\\sum$', tooltip: 'Tổng Sigma', tpl: { template: '\\sum_{i=1}^{n}', cursorOffset: 0, wrapSelection: false } },
        { label: '$\\lim$', tooltip: 'Giới hạn', tpl: { template: '\\lim_{x \\to \\infty}', cursorOffset: 0, wrapSelection: false } },
        { label: '$\\frac{d}{dx}$', tooltip: 'Đạo hàm phân thức', tpl: { template: '\\frac{d}{dx}', cursorOffset: 0 } },
        { label: '$f\'(x)$', tooltip: 'Đạo hàm phẩy', tpl: { template: "f'()", cursorOffset: 1, wrapSelection: true } },
      ]
    },
    {
      name: 'Ký hiệu',
      items: [
        { label: '$\\alpha$', tooltip: 'Alpha', tpl: { template: '\\alpha', cursorOffset: 0 } },
        { label: '$\\beta$', tooltip: 'Beta', tpl: { template: '\\beta', cursorOffset: 0 } },
        { label: '$\\pi$', tooltip: 'Pi', tpl: { template: '\\pi', cursorOffset: 0 } },
        { label: '$\\Delta$', tooltip: 'Delta', tpl: { template: '\\Delta', cursorOffset: 0 } },
        { label: '$\\infty$', tooltip: 'Vô cực', tpl: { template: '\\infty', cursorOffset: 0 } },
        { label: '$\\approx$', tooltip: 'Xấp xỉ', tpl: { template: '\\approx', cursorOffset: 0 } },
        { label: '$\\neq$', tooltip: 'Khác', tpl: { template: '\\neq', cursorOffset: 0 } },
        { label: '$\\in$', tooltip: 'Thuộc', tpl: { template: '\\in', cursorOffset: 0 } },
        { label: '$\\pm$', tooltip: 'Cộng trừ', tpl: { template: '\\pm', cursorOffset: 0 } },
        { label: '$\\rightarrow$', tooltip: 'Mũi tên', tpl: { template: '\\rightarrow', cursorOffset: 0 } },
        { label: '$\\implies$', tooltip: 'Suy ra', tpl: { template: '\\implies', cursorOffset: 0 } },
        { label: '$\\forall$', tooltip: 'Với mọi', tpl: { template: '\\forall', cursorOffset: 0 } },
        { label: '$\\exists$', tooltip: 'Tồn tại', tpl: { template: '\\exists', cursorOffset: 0 } },
      ]
    },
    {
      name: 'Ma trận',
      items: [
        // All matrix templates are wrapped in $$...$$ so they render as block math automatically
        {
          label: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$',
          tooltip: 'Ma trận tròn (2×2)',
          tpl: { template: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$', cursorOffset: 16 }
        },
        {
          label: '$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$',
          tooltip: 'Ma trận vuông (2×2)',
          tpl: { template: '$$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$$', cursorOffset: 16 }
        },
        {
          label: '$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$',
          tooltip: 'Định thức (2×2)',
          tpl: { template: '$$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$$', cursorOffset: 16 }
        },
        {
          label: '$\\begin{Vmatrix} a & b \\\\ c & d \\end{Vmatrix}$',
          tooltip: 'Norm matrix (2×2)',
          tpl: { template: '$$\\begin{Vmatrix} a & b \\\\ c & d \\end{Vmatrix}$$', cursorOffset: 16 }
        },
        {
          label: 'Ma trận 3×3',
          isText: true,
          tooltip: 'Ma trận vuông (3×3)',
          tpl: { template: '$$\\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\\\ 7 & 8 & 9 \\end{bmatrix}$$', cursorOffset: 16 }
        },
        {
          label: '$\\begin{cases} a \\\\ b \\end{cases}$',
          tooltip: 'Hệ phương trình',
          tpl: { template: '$$\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}$$', cursorOffset: 15 }
        },
      ]
    },
    {
      name: 'Tất cả',
      items: []
    }
  ];

  allItems = computed(() => {
    return this.groups.filter(g => g.name !== 'Tất cả').flatMap(g => g.items);
  });

  setTab(index: number) {
    this.activeTab.set(index);
  }

  insertFormula(tpl: FormulaTemplate, event: MouseEvent) {
    event.preventDefault();
    this.formulaService.insertFormula(tpl);
  }
}
