import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-audit-info',
  imports: [DatePipe],
  templateUrl: './audit-info.component.html',
  styleUrl: './audit-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditInfoComponent {
  createdByName = input<string>('');
  updatedByName = input<string>('');
  createdAt = input<string>('');
  updatedAt = input<string>('');
  compact = input(false);
}
