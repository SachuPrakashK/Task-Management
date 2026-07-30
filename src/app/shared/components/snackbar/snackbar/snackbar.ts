import { Component, inject } from '@angular/core';
import { SnackbarService } from '../../../services/snackbar';

@Component({
  selector: 'app-snackbar',
  imports: [],
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.scss',
})
export class Snackbar {
    protected readonly snackbarService = inject(SnackbarService);

  private readonly icons: Record<string, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  iconFor(type: string): string {
    return this.icons[type] ?? '';
  }
}
