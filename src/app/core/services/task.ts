import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { Task, TaskFormValue } from '../models/task.model';

const STORAGE_KEY = 'task-management:tasks';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);

  private readonly _tasks = signal<Task[]>([]);
  private readonly _loaded = signal(false);

  readonly tasks = this._tasks.asReadonly();
  readonly loaded = this._loaded.asReadonly();

    loadTasks() {
    if (this._loaded()) return;

    const stored = this.readStorage();
    if (stored) {
      this._tasks.set(stored);
      this._loaded.set(true);
      return;
    }

    this.http.get<Task[]>('assets/tasks.json').pipe(
      tap((tasks) => {
        this._tasks.set(tasks);
        this._loaded.set(true);
        this.writeStorage(tasks);
      }),
      catchError(() => {
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
