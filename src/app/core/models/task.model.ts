export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
}

export type TaskFormValue = Omit<Task, 'id'>;

export const TASK_STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
