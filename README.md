# Task Management Module

A modern Task Management application built with **Angular 21** using
Standalone Components, Angular Signals, Reactive Forms, lazy loading,
and a feature-based architecture.

The project was developed as part of an Angular Developer Machine Test
with a strong focus on:

- Modern Angular architecture
- Clean code principles
- Scalability
- Reusable components
- Accessibility
- Performance
- Production-ready patterns

Unlike a minimal CRUD implementation, this project includes
threaded comments, reusable UI components, signal-based state
management, structured error handling, persistent storage,
unit testing, and several UX improvements.

## Setup

```bash
npm install
npm start        # ng serve, http://localhost:4200
npm run build    # production build -> dist/task-management
```

Requires Node.js 20+ (developed and built against Node 22).

## Angular version

- Angular **21.2.0** (standalone components, no NgModules)
- Angular CLI 21.2.19
- TypeScript 5.9

## Packages used

| Package | Why |
|---|---|
| `@angular/*` (core, common, forms, router) | Framework, Reactive Forms, Router |
| `ngx-editor` (^19.0.0-beta.1, ProseMirror-based) | Rich text editor for the task description field — supports bold/italic/underline/bullet list out of the box, and implements `ControlValueAccessor` so it drops straight into a `formControlName` like any other input |

No other runtime dependencies. No calendar library — see "Calendar view" below for why.

## Application architecture

```
src/
  environments/
    environment.ts               # dev config: storage keys, feature flags
    environment.production.ts    # swapped in by angular.json's fileReplacements
  app/
    core/
      models/
        task.model.ts     # Task interface, TaskStatus enum, TASK_STATUSES
        comment.model.ts  # TaskComment (self-referential — replies: TaskComment[])
        result.model.ts   # OperationResult<T> — structured success/failure for store methods
      services/
        task.service.ts     # signal-based store: tasks + CRUD + HTTP load
        comment.service.ts  # signal-based store: comments, recursive reply insertion
    features/
      tasks/
        task-list/         # list, search, status filter, entry point for view/edit/delete
        task-form/          # Reactive Form shared by create + edit, ngx-editor integration
        task-details/       # full task view, hosts the comments section
        task-comments/
          task-comments.ts       # add-comment form + top-level list
          comment-node/          # recursive node — renders one comment + its own replies
      calendar/
        calendar-view/      # month grid, tasks plotted by deadline, status-colored
    shared/
      components/
        header/           # top nav bar
        spinner/          # reusable loading indicator (sm/md/lg, inline mode for buttons)
        snackbar/          # toast notification stack, mounted once in App
        confirm-dialog/    # modal confirm dialog w/ focus trap, mounted once in App
        card/              # generic surface/border/shadow shell — dedupes card styling
        empty-state/       # reusable "nothing here" message
        task-actions/       # Edit/Delete button pair with a shared busy state
      services/
        snackbar.service.ts        # signal-based toast queue (success/error/info)
        confirm-dialog.service.ts  # promise-based modal, replaces window.confirm()
        storage.service.ts          # the only file that touches localStorage
      validators/
        not-blank.validator.ts          # rejects whitespace-only input
        not-past-date.validator.ts      # deadline can't be in the past
        rich-text-length.validator.ts   # blank/maxlength check on ngx-editor's HTML value
      constants/validation.constants.ts   # MIN/MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH
      utils/
        id.util.ts           # generateId() — one seam if ID generation ever changes
        date.util.ts          # formatIsoDate()
        sort-tasks.util.ts     # sortTasksByDeadline()
        strip-html.util.ts      # stripHtmlToText() — shared by the pipe and the rich-text validator
      pipes/strip-html.pipe.ts   # HTML -> plain text preview for list cards
```

`App` (the root component) is just a shell: `<app-header />`, the
`<router-outlet />`, `<app-snackbar />`, and `<app-confirm-dialog />` all
mounted once so any component in the tree can push a toast or open a
confirm modal.

Routing is done with `loadComponent` (per-route lazy loading) instead of a
single eagerly-loaded module — each feature is its own chunk, confirmed in the
production build output (`task-form`, `task-details`, `task-list`,
`calendar-view` all ship as separate lazy chunks).

### Screenshots

| Task List | Create Task |
|-----------|-------------|
| ![](docs/images/task_list.gif) | ![](docs/images/create_task.gif) |

| Task Details | Calendar |
|--------------|----------|
| ![](docs/images/task_details.gif) | ![](docs/images/calendar.gif) |

| Comment Section |
|-----------------|
| ![](docs/images/comments.gif) |



### State management: Angular Signals (no NgRx)

For an entity this size — one core resource (`Task`), one dependent resource
(`TaskComment`), straightforward CRUD, no cross-cutting async orchestration —
a signal-based store gives the properties that matter (single source of
truth, computed/derived views, fine-grained change detection) without
NgRx's actions/reducers/effects boilerplate or the extra dependency. `TaskService`
and `CommentService` each expose a private writable signal and a read-only
public view, with `computed()` used for derived state (filtered/sorted task
list, calendar day buckets, task counts). If this module grew to include
cross-feature workflows, undo/redo, or devtools-based time-travel debugging,
NgRx would become the better trade-off — signals were the right-sized choice
here.

### Persistence: TaskService → StorageService → localStorage

Neither `TaskService` nor `CommentService` touches `localStorage` directly —
both go through `StorageService`. That's the seam if persistence ever moves
to IndexedDB or a real backend: only `StorageService` changes, not the two
stores or anything that consumes them. It also centralizes corruption
recovery — a `JSON.parse` failure (manually edited storage, a partial write)
clears the bad entry and reports it via the snackbar instead of leaving each
store to reinvent that handling, and callers fall back to the
`assets/tasks.json` seed automatically.

Storage keys, the (currently empty) API base URL, and a feature flag live in
`src/environments/environment.ts`, swapped for `environment.production.ts`
on a production build via `angular.json`'s `fileReplacements` — so nothing
about *where* data lives is hardcoded in the services themselves.

### Structured results instead of silent no-ops

`TaskService.update()` and `.delete()` return an `OperationResult<T>`
(`{ success, data?, error? }`) rather than quietly doing nothing when an id
doesn't match anything. This mirrors the shape an HTTP call would eventually
return, so if this store's internals are ever swapped for a real API, the
calling components (`TaskForm`, `TaskList`, `TaskDetails`) don't need to
change what they check — they already branch on `result.success` and surface
`result.error` via a snackbar.

### Comments: recursion, not a fixed depth

`CommentNode` is a standalone component that imports itself and renders one
`<app-comment-node>` per child reply. Depth is unbounded by construction —
there's no "max nesting level" anywhere in the code. Reply events bubble up
through each ancestor's `(reply)` output until they reach `TaskComments`,
which is the only place that talks to `CommentService`; the recursive
component itself has no direct dependency on the comment store, which keeps
it easy to test and reuse.

*(Known trade-off: the recursive `<app-comment-node>` element sits between
each `<li>` and its parent `<ul>` in the DOM, which isn't fully spec-clean
list semantics for assistive tech. A fully correct fix means switching the
whole comments tree from native `ul`/`li` to `div[role=list]`/
`div[role=listitem]` — left as-is here to keep the change bounded, but worth
naming rather than leaving implicit.)*

### Calendar view

The assignment listed FullCalendar / Angular Calendar as examples but didn't
require a specific library, so I built a small custom month-grid component
instead of pulling in a third-party calendar package. Reasoning:
- Angular 21 is very new; several community calendar libraries hadn't
  published Angular 21-compatible peer dependencies at the time of writing.
- The actual requirement — plot tasks by deadline, color by status, click to
  navigate — is a fairly small surface area, and a compact component keeps
  full control over both without a peer-dependency risk or extra bundle
  weight.
- It's a `computed()` signal over `TaskService.tasks()`, so it reuses the
  same store as everything else with no extra wiring.

### Shared UI components

Three near-identical patterns were pulled out once each duplication showed
up a second and third time:
- **`Card`** — the "white surface, border, radius, shadow" look was declared
  separately in the task card, detail page, comments section, task form, and
  calendar grid. It's now one component (`padding` and `clip` inputs cover
  every variant seen so far); each feature's own stylesheet only handles
  what's *inside* the card.
- **`EmptyState`** — the "nothing here yet" message (no tasks match filters,
  task not found, no comments yet) was three copies of the same markup with
  slightly different text.
- **`TaskActions`** — the Edit/Delete button pair, including the busy-state
  spinner-swap and disabling, had already drifted slightly between its two
  copies (list card footer, detail page header) before being merged into one
  component with a `compact` input for the tighter card-footer sizing.

### Performance Optimizations

- Angular Signals for fine-grained reactivity
- `computed()` signals for derived state
- Route-level lazy loading
- Cached search indexing
- Shared reusable components
- `ChangeDetectionStrategy.OnPush` for presentation and signal-driven components to minimize unnecessary change detection cycles

### Performance: search indexing

`TaskList`'s search used to re-run `task.title.toLowerCase()` for every task
on every keystroke, even though the titles themselves hadn't changed. A
`searchIndex` computed now pre-normalizes each task's title once, only when
the underlying task list changes; typing in the search box re-normalizes
just the (much shorter) search term and filters against the cached titles.
The list also defaults to soonest-deadline-first via `sortTasksByDeadline()`
rather than arbitrary insertion order.

### Validation

The task form uses Reactive Forms with:
- `title`: required, not blank (`notBlankValidator()` — catches
  whitespace-only input that `required` alone lets through), 3–120
  characters (`MIN_TITLE_LENGTH`/`MAX_TITLE_LENGTH`)
- `description`: required, not blank, and under `MAX_DESCRIPTION_LENGTH`
  characters — checked via `richTextValidator()` against the *plain-text*
  content (HTML tags stripped first), so the limit isn't misleadingly
  counting markup characters from ngx-editor's HTML output
- `deadline`: required, plus `notPastDateValidator()` (the assignment listed
  this as optional — implemented it since it's a one-line validator and a
  realistic real-world rule)
- `status`: required, defaults to `TaskStatus.Pending` on create

### Accessibility

- Icon-only buttons (calendar prev/next, the snackbar dismiss button, the
  submit/delete buttons while their busy-state spinner is showing) all have
  an explicit `aria-label` — several of these have no visible text at all in
  their busy state, so relying on button content would leave them unlabeled
  exactly when it matters most.
- Every input has an accessible name: real `<label for>` pairs where the
  form is a single instance on the page (task title/deadline/status, the
  top-level "add a comment" form — using a visually-hidden `.sr-only` label
  where a visible one would just duplicate the placeholder); `aria-label`
  instead of `label/for` on the recursive reply form specifically, since
  `CommentNode` renders many times per page and duplicate `id`/`for` pairs
  would be invalid HTML.
- The confirm modal (`ConfirmDialog`) traps focus, auto-focuses Cancel on
  open, restores focus to whatever triggered it on close, and Escape still
  cancels — all of that lives in one component so every future use of
  `ConfirmDialogService.confirm()` gets it for free.
- The task list card used to be a `(click)`-handled `<div>` — invisible to
  keyboard/screen-reader navigation entirely. The clickable region (title +
  description) is now a real `<a [routerLink]>`, natively focusable and
  Enter-activatable, deliberately *not* wrapping the Edit/Delete buttons
  (nesting interactive controls inside a link is its own accessibility
  antipattern) — the trade-off is that the whole card no longer looks
  clickable, only that region does, which is the honest reflection of what's
  actually interactive now.

### Loading and feedback states

- **Spinners** — `TaskList`, `TaskDetails`, `CalendarView`, and `TaskForm`
  (in edit mode) all key off `TaskService.loaded()` and show `<app-spinner>`
  until the store is populated.
- **Busy states on writes** — create/update/delete are local (localStorage)
  writes and resolve instantly, so a spinner tied only to `loaded()` would
  never actually appear during them. `TaskForm.submit()` and both
  `deleteTask()` methods set an explicit `submitting`/`deleting` signal,
  await a short `pauseForFeedback()` (shared util, ~350ms), then perform the
  write — the submit button and delete button (via `TaskActions`) show an
  inline `<app-spinner size="sm" [inline]="true">` and disable themselves
  for that window.
- **Snackbars** — `SnackbarService`, a signal-based toast queue. Wired up
  for: task create/update/delete (success *and* the `OperationResult`
  failure path), invalid form submission, comment/reply added or rejected
  for missing fields, and a failed seed-data fetch or corrupted-storage
  recovery.
- **Confirm modal** — `ConfirmDialogService.confirm(options)` returns a
  `Promise<boolean>`, replacing `window.confirm()` for both delete
  confirmations (task list, task details).
- **Header** — the "+ New Task" link hides itself while `/tasks/new` is the
  active route (tracked via a signal derived from `Router` navigation
  events).

## Assumptions

- Task and comment data is seeded from `public/assets/tasks.json` on the
  *first* run via `HttpClient`, then persisted to `localStorage` from then on
  (per the assignment, no backend persistence was implemented). This means
  added/edited/deleted tasks and comments survive a page refresh, since a
  "task manager" that loses your work on refresh isn't a realistic
  assumption to make even for a scoped exercise. Clearing the browser's
  site data (or `localStorage.clear()` in devtools) resets it back to the
  JSON seed.
- Comments don't require a logged-in user, so each comment/reply form asks
  for a display name inline rather than assuming an auth context.
- Deadlines are date-only (no time component), matching the seed data and
  the calendar's day-level granularity.
- "Delete task" is a hard delete with a confirm dialog — no soft-delete/undo,
  since none was specified.

## Testing the app

1. `npm start`, open `http://localhost:4200`
2. Land on **Tasks** — filter by status, search by title, sorted by nearest
   deadline
3. **+ New Task** — fill in title/description (rich text)/deadline/status,
   submit → redirects to the new task's detail page
4. On a task's detail page, add a comment, then reply to that comment, then
   reply to the reply — nesting has no ceiling
5. **Calendar** — tasks appear on their deadline day, color-coded by status;
   click one to jump to its detail page
