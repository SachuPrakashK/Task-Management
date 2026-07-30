import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { Card } from '../../../shared/components/card/card/card';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../core/services/comment';
import { SnackbarService } from '../../../shared/services/snackbar';
import { EmptyState } from '../../../shared/components/empty-state/empty-state/empty-state';
import { CommentNode } from './comment-node/comment-node';

@Component({
  selector: 'app-task-comments',
  imports: [Card, FormsModule, EmptyState, CommentNode],
  templateUrl: './task-comments.html',
  styleUrl: './task-comments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskComments {
  @Input({ required: true }) taskId!: string;

  protected readonly commentService = inject(CommentService);
  private readonly snackbar = inject(SnackbarService);

  protected readonly author = signal('');
  protected readonly text = signal('');

  get comments() {
    return this.commentService.commentsFor(this.taskId);
  }

  addComment() {
    const authorName = this.author().trim();
    const commentText = this.text().trim();

    if (!authorName && !commentText) {
      this.snackbar.error('Please enter your name and a comment.');
      return;
    }
    this.commentService.addComment(this.taskId, authorName, commentText);
    this.author.set('');
    this.text.set('');
  }
  
  addReply(event: { parentId: string; author: string; text: string }): void {
    this.commentService.addReply(this.taskId, event.parentId, event.author, event.text);
  }
}
