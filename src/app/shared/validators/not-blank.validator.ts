import { ValidationErrors, ValidatorFn } from '@angular/forms';

export function notBlankValidator(): ValidatorFn {
  return (control): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string' || value.length === 0) return null;
    return value.trim().length === 0 ? { blank: true } : null;
  };
}
