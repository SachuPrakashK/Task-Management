import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../shared/services/storage';
import { TaskComment } from '../models/comment.model';
import { generateId } from '../../shared/utils/id.util';

const STORAGE_KEY = environment.storageKeys.comments;

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly storage = inject(StorageService);

  private readonly _commentsByTask = 
    signal<Record<string, TaskComment[]>>(this.readInitial());

  readonly commentsByTask = this._commentsByTask.asReadonly();

  commentsFor(taskId: string): TaskComment[] {
    return this._commentsByTask()[taskId] ?? [];
  }

  addComment(taskId: string, author: string, text: string): void {
    const comment: TaskComment = {
      id: generateId(),
      taskId,
      author,
      text,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    this._commentsByTask.update((byTask) => {
      const next = {
        ...byTask,
        [taskId]: [...(byTask[taskId] ?? []), comment],
      };
      this.storage.write(STORAGE_KEY, next);
      return next;
    });
  }

  addReply(taskId: string, parentCommentId: string, author: string, text: string): void {
    const reply: TaskComment = {
      id: generateId(),
      taskId,
      author,
      text,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    this._commentsByTask.update((byTask) => {
      const tree = byTask[taskId] ?? [];
      const next = {
        ...byTask,
        [taskId]: this.insertReply(tree, parentCommentId, reply),
      };
      this.storage.write(STORAGE_KEY, next);
      return next;
    });
  }

  private insertReply(
    comments: TaskComment[],
    parentId: string,
    reply: TaskComment,
  ): TaskComment[] {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...comment.replies, reply] };
      }
      if (comment.replies.length) {
        return { ...comment, replies: this.insertReply(comment.replies, parentId, reply) };
      }
      return comment;
    });
  }

  private readInitial(): Record<string, TaskComment[]> {
    const stored = this.storage.read<Record<string, TaskComment[]>>(STORAGE_KEY);
    return stored && typeof stored === 'object' ? stored : {};
  }
}
