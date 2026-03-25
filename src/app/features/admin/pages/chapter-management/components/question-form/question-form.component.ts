import { Component, ChangeDetectionStrategy, input, output, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { QuestionRequest, QuestionResponse, QuestionType, Difficulty } from '../../../../../../models/question.model';
import { MathContentComponent } from '../../../../../../shared/components/math-content/math-content.component';
import { FormulaToolbarComponent } from '../../../../../../shared/components/formula-toolbar/formula-toolbar.component';
import { ActiveEditorDirective } from '../../../../../../shared/directives/active-editor/active-editor.directive';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-question-form',
  imports: [ReactiveFormsModule, MathContentComponent, FormulaToolbarComponent, ActiveEditorDirective],
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  // Inputs
  questionToEdit = input<QuestionResponse | null>(null);
  isKatexEnabled = input<boolean>(false);
  isSaving = input<boolean>(false);

  // Outputs
  save = output<QuestionRequest>();
  cancel = output<void>();

  // Tabs
  activeTab = signal<'editor' | 'preview'>('editor');

  // Form
  form!: FormGroup;

  ngOnInit() {
    this.initForm();
    if (this.questionToEdit()) {
      this.patchForm(this.questionToEdit()!);
    }
  }

  get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  get questionType(): QuestionType {
    return this.form.get('type')?.value;
  }

  private initForm() {
    this.form = this.fb.group({
      type: ['SINGLE_CHOICE', Validators.required],
      difficulty: ['MEDIUM', Validators.required],
      content: ['', Validators.required],
      explanation: [''],
      options: this.fb.array([
        this.createOptionGroup('A', true),
        this.createOptionGroup('B', false),
        this.createOptionGroup('C', false),
        this.createOptionGroup('D', false)
      ])
    });

    // Reset correct answers when swapping type
    this.form.get('type')?.valueChanges.subscribe(type => {
      const opts = this.optionsArray.controls;
      if (type === 'SINGLE_CHOICE') {
        // Enforce only one correct
        let hasCorrect = false;
        opts.forEach((opt, idx) => {
          if (opt.get('isCorrect')?.value) {
            if (hasCorrect) opt.get('isCorrect')?.setValue(false, { emitEvent: false });
            hasCorrect = true;
          }
        });
        if (!hasCorrect && opts.length > 0) opts[0].get('isCorrect')?.setValue(true, { emitEvent: false });
      }
    });
  }

  private createOptionGroup(label: string, isCorrect: boolean = false): FormGroup {
    return this.fb.group({
      label: [label, Validators.required],
      content: ['', Validators.required],
      isCorrect: [isCorrect]
    });
  }

  private patchForm(q: QuestionResponse) {
    this.form.patchValue({
      type: q.type,
      difficulty: q.difficulty,
      content: q.content,
      explanation: q.explanation || ''
    });

    // Replace options array
    this.optionsArray.clear();
    q.options.forEach(o => {
      this.optionsArray.push(this.createOptionGroup(o.label, o.isCorrect));
      const lastGroup = this.optionsArray.at(this.optionsArray.length - 1);
      lastGroup.patchValue({ content: o.content }); // Patch content separately to ensure it binds correctly
    });
  }

  addOption() {
    if (this.optionsArray.length >= 6) return;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLabel = labels[this.optionsArray.length] ?? String(this.optionsArray.length + 1);
    this.optionsArray.push(this.createOptionGroup(nextLabel, false));
  }

  removeOption(index: number) {
    if (this.optionsArray.length <= 2) return;
    this.optionsArray.removeAt(index);
    // Relabel
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    this.optionsArray.controls.forEach((ctrl, i) => {
      ctrl.get('label')?.setValue(labels[i] ?? String(i + 1), { emitEvent: false });
    });
  }

  onCorrectChange(index: number) {
    if (this.questionType === 'SINGLE_CHOICE') {
      this.optionsArray.controls.forEach((ctrl, i) => {
        ctrl.get('isCorrect')?.setValue(i === index, { emitEvent: false });
      });
    }
  }

  setTab(tab: 'editor' | 'preview') {
    this.activeTab.set(tab);
  }

  onSubmit() {
    if (this.form.invalid) {
      toast.warning('Vui lòng điền đầy đủ nội dung câu hỏi và đáp án.');
      this.form.markAllAsTouched();
      return;
    }

    const value: QuestionRequest = this.form.value;

    const correctCount = value.options.filter(o => o.isCorrect).length;
    if (value.type === 'SINGLE_CHOICE' && correctCount !== 1) {
      toast.warning('Câu hỏi một đáp án phải có đúng 1 đáp án đúng.');
      return;
    }
    if (value.type === 'MULTI_CHOICE' && correctCount < 2) {
      toast.warning('Câu hỏi nhiều đáp án phải có ít nhất 2 đáp án đúng.');
      return;
    }

    this.save.emit(value);
  }

  onCancel() {
    this.cancel.emit();
  }
}
