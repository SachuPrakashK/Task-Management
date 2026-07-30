import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../../core/services/task';
import { Router, RouterLink } from '@angular/router';
import { TASK_STATUSES, TaskStatus } from '../../../core/models/task.model';
import { statusClass } from '../../../shared/utils/status.util';
import { sortTasksByDeadline } from '../../../shared/utils/sort-tasks.util';
import { Card } from '../../../shared/components/card/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state/empty-state';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { StripHtmlPipe } from '../../../shared/pipes/strip-html-pipe';
import { SnackbarService } from '../../../shared/services/snackbar';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog';
import { pauseForFeedback } from '../../../shared/utils/pause-for-feedback.util';
import { TaskActions } from '../../../shared/components/task-actions/task-actions';


@Component({
  selector: 'app-task-list',
  imports: [RouterLink, StripHtmlPipe, Spinner, Card, EmptyState, TaskActions],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {
  protected readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
    private readonly snackbar = inject(SnackbarService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly statuses = TASK_STATUSES;
  protected readonly statusClass = statusClass;
  protected readonly activeFilter = signal<TaskStatus | 'All'>('All');
  protected readonly searchTerm = signal('');
    protected readonly deletingId = signal<string | null>(null);

  private readonly searchIndex = computed(() =>
    this.taskService.tasks().map((task) => ({
      task,
      titleLower: task.title.toLowerCase(),
    })),
  );

  protected readonly filteredTasks = computed(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();
    const matches = this.searchIndex()
      .filter(({ task }) => filter === 'All' || task.status === filter)
      .filter(({ titleLower }) => !term || titleLower.includes(term))
      .map(({ task }) => task);
    return sortTasksByDeadline(matches);
  });

  ngOnInit(): void {
    this.taskService.loadTasks();
  }

  setFilter(status: TaskStatus | 'All'): void {
    this.activeFilter.set(status);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  editTask(id: string): void {
    this.router.navigate(['/tasks', id, 'edit-task']);
  }

  async deleteTask(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete task',
      message: 'Delete this task? This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    this.deletingId.set(id);
    await pauseForFeedback();
    const result = this.taskService.delete(id);
    this.deletingId.set(null);

    if (!result.success) {
      this.snackbar.error(result.error ?? 'Could not delete this task.');
      return;
    }
    this.snackbar.success('Task deleted.');
  }
}
