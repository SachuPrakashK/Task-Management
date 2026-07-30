import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'tasks', 
    pathMatch: 'full' 
  },
  {
    path: 'tasks',
    loadComponent: () => 
        import('./features/tasks/task-list/task-list').then((m) => m.TaskList),
  },
  {
    path: 'tasks/add-task',
    loadComponent: () => 
        import('./features/tasks/task-form/task-form').then((m) => m.TaskForm),
  },
  {
    path: 'tasks/:id/edit-task',
    loadComponent: () => 
        import('./features/tasks/task-form/task-form').then((m) => m.TaskForm),
  },
  {
    path: 'task-details/:id',
    loadComponent: () =>
      import('./features/tasks/task-details/task-details').then((m) => m.TaskDetails),
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./features/calendar/calendar-view/calendar-view').then((m) => m.CalendarView),
  },
  { 
    path: '**', 
    redirectTo: 'tasks' 
  },
];
