import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Spinner } from '../spinner/spinner';


/**
 * The Edit/Delete pair was duplicated (with slightly different bindings) in
 * the task list card footer and the task details header. Centralizing it
 * means the busy-state/disabled-state logic — which had already drifted
 * slightly between the two copies — only needs to be right once.
 */
@Component({
  selector: 'app-task-actions',
  standalone: true,
  imports: [Spinner],
  templateUrl: './task-actions.html',
  styleUrl: './task-actions.scss',
})
export class TaskActions {
  /** True while a delete is in flight — disables both buttons and swaps
   * Delete's label for an inline spinner. */
  @Input() busy = false;
  /** Smaller button sizing for tight spaces like the task list card footer. */
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
