import { Task } from '../../core/models/task.model';

export function sortTasksByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline));
}
