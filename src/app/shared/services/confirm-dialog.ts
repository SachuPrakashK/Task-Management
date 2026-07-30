import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive (e.g. deletes) */
  danger?: boolean;
}

interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly _request = signal<ConfirmRequest | null>(null);

  readonly request = this._request.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._request.set({
        title: options.title ?? 'Please confirm',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        danger: options.danger ?? false,
        resolve,
      });
    });
  }

  respond(value: boolean): void {
    const req = this._request();
    if (!req) return;
    this._request.set(null);
    req.resolve(value);
  }
}
