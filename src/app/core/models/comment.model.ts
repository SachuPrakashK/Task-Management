export interface TaskComment {
  id: string;
  taskId: string;
  author: string;
  text: string;
  createdAt: string;
  replies: TaskComment[];
}