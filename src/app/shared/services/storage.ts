import { Injectable, inject } from '@angular/core';
import { SnackbarService } from './snackbar';


@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly snackbar = inject(SnackbarService);


  read<T>(key: string): T | null {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      // localStorage itself unavailable (private browsing, disabled, etc.)
      return null;
    }

    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      this.clear(key);
      this.snackbar.error('Saved data was corrupted and has been reset.');
      return null;
    }
  }

  write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      this.snackbar.error('Unable to save changes — storage may be full or unavailable.');
    }
  }

  clear(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Nothing more we can do if storage itself is inaccessible.
    }
  }
}
