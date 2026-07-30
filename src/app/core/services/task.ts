import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { Task, TaskFormValue } from '../models/task.model';
import { StorageService } from '../../shared/services/storage';
import { SnackbarService } from '../../shared/services/snackbar';

const STORAGE_KEY = 'task-management:tasks';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly snackbar = inject(SnackbarService);

  private readonly _tasks = signal<Task[]>([]);
  private readonly _loaded = signal(false);

  readonly tasks = this._tasks.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  readonly taskCount = computed(() => this._tasks().length);

  loadTasks(): void {
    if (this._loaded()) return;

    const stored = this.storage.read<Task[]>(STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      this._tasks.set(stored);
      this._loaded.set(true);
      return;
    }

    this.http.get<Task[]>('assets/tasks.json').pipe(
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
      })
    ).subscribe();
  }

  readStorage(): Task[] | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : null;
    } catch {
      // Storage unavailable (SSR, private-mode restrictions, corrupt JSON) —
      // fall back to the JSON seed as if nothing were stored.
      return null;
    }
  }

  writeStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage full or unavailable — the in-memory signal still works for
      // the rest of the session, it just won't survive a refresh.
    }
  }
}
