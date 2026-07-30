export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
}

export type TaskFormValue = Omit<Task, 'id'>;

export const TASK_STATUSES: TaskStatus[] = [
  TaskStatus.Pending,
  TaskStatus.InProgress,
  TaskStatus.Completed,
];
