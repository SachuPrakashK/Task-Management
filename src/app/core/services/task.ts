import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { Task, TaskFormValue } from '../models/task.model';
import { OperationResult, fail, ok } from '../models/result.model';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../shared/services/storage';
import { SnackbarService } from '../../shared/services/snackbar';
import { generateId } from '../../shared/utils/id.util';

const STORAGE_KEY = environment.storageKeys.tasks;

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);
  private readonly storage = inject(StorageService);

  private readonly _tasks = signal<Task[]>([]);
  private readonly _loaded = signal(false);

  /** Read-only view of all tasks for consumers */
  readonly tasks = this._tasks.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly taskCount = computed(() => this._tasks().length);

  /** Loads from storage if present; otherwise seeds from assets/tasks.json. */
  loadTasks(): void {
    if (this._loaded()) return;

    const stored = this.storage.read<Task[]>(STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      this._tasks.set(stored);
      this._loaded.set(true);
      return;
    }

    this.http
      .get<Task[]>('assets/tasks.json')
      .pipe(
        tap((tasks) => {
          this._tasks.set(tasks);
          this._loaded.set(true);
          this.storage.write(STORAGE_KEY, tasks);
        }),
        catchError(() => {
          this.snackbar.error('Failed to load tasks. Starting with an empty list.');
          this._tasks.set([]);
          this._loaded.set(true);
          return of(null);
        }),
      )
      .subscribe();
  }

  getById(id: string): Task | undefined {
    return this._tasks().find((t) => t.id === id);
  }

  add(value: TaskFormValue): OperationResult<Task> {
    const task: Task = { id: generateId(), ...value };
    this._tasks.update((tasks) => {
      const next = [task, ...tasks];
      this.storage.write(STORAGE_KEY, next);
      return next;
    });
    return ok(task);
  }

  update(id: string, value: TaskFormValue): OperationResult<Task> {
    if (!this._tasks().some((t) => t.id === id)) {
      return fail(`Task with id "${id}" was not found.`);
    }

    let updated!: Task;
    this._tasks.update((tasks) => {
      const next = tasks.map((t) => {
        if (t.id !== id) return t;
        updated = { ...t, ...value };
        return updated;
      });
      this.storage.write(STORAGE_KEY, next);
      return next;
    });
    return ok(updated);
  }

  delete(id: string): OperationResult {
    if (!this._tasks().some((t) => t.id === id)) {
      return fail(`Task with id "${id}" was not found.`);
    }

    this._tasks.update((tasks) => {
      const next = tasks.filter((t) => t.id !== id);
      this.storage.write(STORAGE_KEY, next);
      return next;
    });
    return ok();
  }
}
