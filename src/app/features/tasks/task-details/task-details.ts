import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TaskActions } from '../../../shared/components/task-actions/task-actions';
import { EmptyState } from '../../../shared/components/empty-state/empty-state/empty-state';
import { Card } from '../../../shared/components/card/card/card';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { TaskComments } from '../task-comments/task-comments';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SnackbarService } from '../../../shared/services/snackbar';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog';
import { TaskService } from '../../../core/services/task';
import { statusClass } from '../../../shared/utils/status.util';
import { pauseForFeedback } from '../../../shared/utils/pause-for-feedback.util';

@Component({
  selector: 'app-task-details',
  imports: [RouterLink, TaskComments, Spinner, Card, EmptyState, TaskActions],
  templateUrl: './task-details.html',
  styleUrl: './task-details.scss',
})
export class TaskDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly taskService = inject(TaskService);

  protected readonly statusClass = statusClass;
  protected readonly taskId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly deleting = signal(false);

  protected readonly task = computed(() =>
    this.taskService.tasks().find((t) => t.id === this.taskId()),
  );

  ngOnInit(): void {
    this.taskService.loadTasks();
  }

  editTask(): void {
    this.router.navigate(['/tasks', this.taskId(), 'edit']);
  }

  async deleteTask(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete task',
      message: 'Delete this task? This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    this.deleting.set(true);
    await pauseForFeedback();
    const result = this.taskService.delete(this.taskId());
    this.deleting.set(false);

    if (!result.success) {
      this.snackbar.error(result.error ?? 'Could not delete this task.');
      return;
    }
    this.snackbar.success('Task deleted.');
    this.router.navigate(['/tasks']);
  }
}
