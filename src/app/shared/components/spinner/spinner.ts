import { Component, Input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  host: {
    // Explicit rather than relying on the default block child auto-sizing
    // an inline host — inline mode specifically must NOT be block, or it
    // forces a line break inside whatever button it's placed in.
    '[style.display]': "inline ? 'inline-flex' : 'block'",
  },
})
export class Spinner {
  @Input() size: SpinnerSize = 'md';
  @Input() label = '';
  /** Compact, padding-free layout for use inside buttons/inline contexts */
  @Input() inline = false;
}
