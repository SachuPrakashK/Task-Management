import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
import { DatePipe } from '@angular/common';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants/pagination.constant';

@Component({
  selector: 'app-task-list',
  imports: [RouterLink, StripHtmlPipe, Spinner, Card, EmptyState, TaskActions, DatePipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);
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

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTasks().length / this.pageSize())),
  );

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly paginatedTasks = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();

    return this.filteredTasks().slice(start, end);
  });

  protected readonly startItem = computed(() => {
    if (this.filteredTasks().length === 0) return 0;

    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  protected readonly endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredTasks().length),
  );

  constructor() {
    effect(() => {
      this.searchTerm();
      this.activeFilter();

      this.currentPage.set(1);
    });
  }

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
    this.router.navigate(['/task', id, 'edit-task']);
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

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }
}
