import { ValidationErrors, ValidatorFn } from '@angular/forms';
import { stripHtmlToText } from '../utils/strip-html.util';

export function richTextValidator(options: { maxLength: number }): ValidatorFn {
  return (control): ValidationErrors | null => {
    const raw = control.value;
    if (typeof raw !== 'string' || raw.length === 0) return null;

    const text = stripHtmlToText(raw);
    if (text.length === 0) return { blank: true };
    if (text.length > options.maxLength) {
      return { maxlength: { requiredLength: options.maxLength, actualLength: text.length } };
    }
    return null;
  };
}
