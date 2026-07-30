import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-task-actions',
  standalone: true,
  imports: [Spinner],
  templateUrl: './task-actions.html',
  styleUrl: './task-actions.scss',
})
export class TaskActions {
  @Input() busy = false;
  @Input() compact = false;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit();
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }
}
