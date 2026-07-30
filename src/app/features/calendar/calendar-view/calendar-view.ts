import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Task } from '../../../core/models/task.model';
import { statusClass } from '../../../shared/utils/status.util';
import { TaskService } from '../../../core/services/task';
import { Router } from '@angular/router';
import { formatIsoDate } from '../../../shared/utils/date.util';
import { Card } from '../../../shared/components/card/card/card';
import { Spinner } from '../../../shared/components/spinner/spinner';

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  isoDate: string;
  tasks: Task[];
}

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Component({
  selector: 'app-calendar-view',
  imports: [Spinner, Card],
  templateUrl: './calendar-view.html',
  styleUrl: './calendar-view.scss',
})
export class CalendarView implements OnInit {
  protected readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  protected readonly statusClass = statusClass;
  protected readonly weekdayLabels = WEEKDAY_LABELS;
  protected readonly viewDate = signal(this.startOfMonth(new Date()));

  protected readonly monthLabel = computed(() => MONTH_FORMATTER.format(this.viewDate()));

  protected readonly tasksByDate = computed(() => {
    const map = new Map<string, Task[]>();
    for (const task of this.taskService.tasks()) {
      const list = map.get(task.deadline) ?? [];
      list.push(task);
      map.set(task.deadline, list);
    }
    return map;
  });

  protected readonly weeks = computed(() => {
    const view = this.viewDate();
    const firstOfMonth = new Date(view.getFullYear(), view.getMonth(), 1);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());

    const today = formatIsoDate(new Date());
    const byDate = this.tasksByDate();
    const days: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      const isoDate = formatIsoDate(date);
      days.push({
        date,
        inCurrentMonth: date.getMonth() === view.getMonth(),
        isToday: isoDate === today,
        isoDate,
        tasks: byDate.get(isoDate) ?? [],
      });
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  });

  ngOnInit(): void {
    this.taskService.loadTasks();
  }

  prevMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(this.startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1)));
  }

  nextMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(this.startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1)));
  }

  today(): void {
    this.viewDate.set(this.startOfMonth(new Date()));
  }

  openTask(taskId: string): void {
    this.router.navigate(['/task-details', taskId]);
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}
