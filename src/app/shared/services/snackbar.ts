import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarMessage {
  id: string;
  type: SnackbarType;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private readonly _messages = signal<SnackbarMessage[]>([]);

  readonly messages = this._messages.asReadonly();

  success(text: string, durationMs = 3000): void {
    this.show(text, 'success', durationMs);
  }

  error(text: string, durationMs = 4500): void {
    this.show(text, 'error', durationMs);
  }

  info(text: string, durationMs = 3000): void {
    this.show(text, 'info', durationMs);
  }

  dismiss(id: string): void {
    this._messages.update((msgs) => msgs.filter((m) => m.id !== id));
  }

  private show(text: string, type: SnackbarType, durationMs: number): void {
    const id = crypto.randomUUID();
    this._messages.update((msgs) => [...msgs, { id, type, text }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}
