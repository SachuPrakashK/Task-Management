import { ValidationErrors, ValidatorFn } from '@angular/forms';

export function notPastDateValidator(): ValidatorFn {
  return (control): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const value = new Date(control.value);
    return value < today ? { pastDate: true } : null;
  };
}
