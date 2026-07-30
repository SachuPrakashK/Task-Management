import { Component, computed, effect, inject, signal } from '@angular/core';
import { TASK_STATUSES, TaskStatus } from '../../../core/models/task.model';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_TITLE_LENGTH,
} from '../../../shared/constants/validation.constant';
import { TaskService } from '../../../core/services/task';
import { SnackbarService } from '../../../shared/services/snackbar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent } from 'ngx-editor';
import { notBlankValidator } from '../../../shared/validators/not-blank.validator';
import { richTextValidator } from '../../../shared/validators/rich-text-length.validator';
import { notPastDateValidator } from '../../../shared/validators/not-past-date.validator';
import { pauseForFeedback } from '../../../shared/utils/pause-for-feedback.util';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Card } from '../../../shared/components/card/card/card';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, RouterLink, Card, Spinner, NgxEditorComponent, NgxEditorMenuComponent],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);
  protected readonly taskService = inject(TaskService);

  protected readonly statuses = TASK_STATUSES;
  protected readonly maxTitleLength = MAX_TITLE_LENGTH;
  protected readonly maxDescriptionLength = MAX_DESCRIPTION_LENGTH;
  protected editor!: Editor;
  protected readonly taskId: string | null = this.route.snapshot.paramMap.get('id');
  protected submitted = false;
  protected readonly submitting = signal(false);
  private patched = false;

  protected readonly form = this.fb.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        notBlankValidator(),
        Validators.minLength(MIN_TITLE_LENGTH),
        Validators.maxLength(MAX_TITLE_LENGTH),
      ],
    ],
    description: [
      '',
      [Validators.required, richTextValidator({ maxLength: MAX_DESCRIPTION_LENGTH })],
    ],
    deadline: ['', [Validators.required, notPastDateValidator()]],
    status: [TaskStatus.Pending, [Validators.required]],
  });

  get isEditMode(): boolean {
    return this.taskId !== null;
  }

  protected readonly loading = computed(() => this.isEditMode && !this.taskService.loaded());

  constructor() {
    effect(() => {
      if (!this.taskId || this.patched) return;
      const existing = this.taskService.tasks().find((t) => t.id === this.taskId);
      if (existing) {
        this.form.patchValue({
          title: existing.title,
          description: existing.description,
          deadline: existing.deadline,
          status: existing.status,
        });
        this.patched = true;
      }
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.taskService.loadTasks();
  }

  async submit(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackbar.error('Please fix the highlighted fields.');
      return;
    }

    this.submitting.set(true);
    const value = this.form.getRawValue();
    await pauseForFeedback();

    const result =
      this.isEditMode && this.taskId
        ? this.taskService.update(this.taskId, value)
        : this.taskService.add(value);

    if (!result.success || !result.data) {
      this.snackbar.error(result.error ?? 'Something went wrong saving this task.');
      this.submitting.set(false);
      return;
    }

    this.snackbar.success(
      this.isEditMode ? 'Task updated successfully.' : 'Task created successfully.',
    );
    this.router.navigate(['/tasks', result.data.id]);
    this.submitting.set(false);
  }

  cancel(): void {
    if (this.isEditMode && this.taskId) {
      this.router.navigate(['/tasks', this.taskId]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}
