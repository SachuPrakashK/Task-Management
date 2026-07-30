import { Component, ElementRef, HostListener, ViewChild, effect, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../services/confirm-dialog';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  protected readonly dialogService = inject(ConfirmDialogService);

  @ViewChild('cancelBtn') private cancelBtnRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('confirmBtn') private confirmBtnRef?: ElementRef<HTMLButtonElement>;

  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const req = this.dialogService.request();
      if (req) {
        this.previouslyFocused = document.activeElement as HTMLElement | null;
        queueMicrotask(() => this.cancelBtnRef?.nativeElement.focus());
      } else if (this.previouslyFocused) {
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.dialogService.request()) return;

    if (event.key === 'Escape') {
      this.dialogService.respond(false);
      return;
    }

    if (event.key !== 'Tab') return;
    const cancel = this.cancelBtnRef?.nativeElement;
    const confirm = this.confirmBtnRef?.nativeElement;
    if (!cancel || !confirm) return;

    if (event.shiftKey && document.activeElement === cancel) {
      event.preventDefault();
      confirm.focus();
    } else if (!event.shiftKey && document.activeElement === confirm) {
      event.preventDefault();
      cancel.focus();
    }
  }

  onCancel(): void {
    this.dialogService.respond(false);
  }

  onConfirm(): void {
    this.dialogService.respond(true);
  }

  onBackdropClick(): void {
    this.dialogService.respond(false);
  }
}
