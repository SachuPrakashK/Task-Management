import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  host: {
    '[style.display]': "inline ? 'inline-flex' : 'block'",
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Spinner {
  @Input() size: SpinnerSize = 'md';
  @Input() label = '';
  @Input() inline = false;
}
