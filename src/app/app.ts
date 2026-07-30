import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { ConfirmDialog } from './shared/components/confirm-dialog/confirm-dialog/confirm-dialog';
import { Snackbar } from './shared/components/snackbar/snackbar/snackbar';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Snackbar, ConfirmDialog],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('task-management');
}
