import { TaskStatus } from '../../core/models/task.model';


export function statusClass(status: TaskStatus): string {
  return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}
