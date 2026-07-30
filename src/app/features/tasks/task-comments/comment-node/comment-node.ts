import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { TaskComment } from '../../../../core/models/comment.model';
import { SnackbarService } from '../../../../shared/services/snackbar';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-node',
  imports: [FormsModule, DatePipe],
  templateUrl: './comment-node.html',
  styleUrl: './comment-node.scss',
})
export class CommentNode {
  @Input({ required: true }) comment!: TaskComment;
  @Input() depth = 0;
  @Output() reply = new EventEmitter<{ parentId: string; author: string; text: string }>();

  private readonly snackbar = inject(SnackbarService);

  protected readonly replying = signal(false);
  protected readonly replyAuthor = signal('');
  protected readonly replyText = signal('');

  toggleReplying() {
    this.replying.update((value) => !value);
  }

  submitReply(): void {
    const author = this.replyAuthor().trim();
    const text = this.replyText().trim();
    if (!author || !text) {
      this.snackbar.error('Please enter your name and a reply.');
      return;
    }

    this.reply.emit({ parentId: this.comment.id, author, text });
    this.replyAuthor.set('');
    this.replyText.set('');
    this.replying.set(false);
  }

  onDescendantReply(event: { parentId: string; author: string; text: string }) {
    this.reply.emit(event);
  }
}
