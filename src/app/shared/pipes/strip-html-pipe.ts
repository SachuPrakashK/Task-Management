import { Pipe, PipeTransform } from '@angular/core';
import { stripHtmlToText } from '../utils/strip-html.util';

@Pipe({ name: 'stripHtml' })
export class StripHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength = 120): string {
    const text = stripHtmlToText(value);
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  }
}
