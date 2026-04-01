---
project_url: https://github.com/users/hojinzs/projects/8
project_number: 8
project_node_id: PVT_kwHOAPiKdM4BTbVg
owner: hojinzs
repository: hojinzs/symphony-example-app
backlog_status: Backlog
backlog_status_id: f75ad846
field_ids:
  status: PVTSSF_lAHOAPiKdM4BTbVgzhAq-yU
  priority: null
  size: null
  estimate: PVTF_lAHOAPiKdM4BTbVgzhAq-4U
status_order:
  - Backlog
  - Ready
  - In progress
  - In review
  - Done
status_options:
  Backlog: "f75ad846"
  Ready: "61e4505c"
  In progress: "47fc9ee4"
  In review: "df73e18b"
  Done: "98236657"
priority_options: {}
size_options: {}
estimate_unit: developer_days
---

# Project Management

This file is the repository-local source of truth for GitHub Project setup, issue shaping, and backlog triage.

## Current Project Shape

- Project board: `hojinzs` user project `#8`
- Repository: `hojinzs/symphony-example-app`
- Active delivery flow: `Backlog -> Ready -> In progress -> In review -> Done`
- Configured project fields:
  - `Status`
  - `Estimate`
- Not currently configured on the board:
  - `Priority`
  - `Size`

Until `Priority` and `Size` fields are added to the project, keep those values in the issue body when they matter for planning.

## Issue Body Template

Use this structure for newly created implementation issues:

```md
## Summary

One paragraph describing the user-visible or system-level change.

## Scope

- Concrete change 1
- Concrete change 2

## Out of Scope

- Explicit non-goal 1

## Acceptance Criteria

- [ ] Observable behavior 1
- [ ] Observable behavior 2

## Implementation Notes

- Relevant files, routes, models, pages, or components
- Constraints such as Wayfinder, Fortify, Inertia, or test coverage needs

## Validation

- `php artisan test --compact --filter=...`
- `npm run lint:check`
- `npm run types:check`

## Dependencies

- Blocking issue or prerequisite, if any
```

Rules:

- Make issues concrete. Name real files, routes, pages, controllers, requests, models, or tests whenever known.
- Acceptance criteria should be externally checkable, not implementation trivia.
- Validation steps should be executable commands, not vague statements.
- If a task depends on another issue, state that dependency explicitly in `Dependencies`.

## Estimate Conventions

Use full-time developer days for the `Estimate` field.

Default guidance:

- `0.5`: copy tweaks, simple validation changes, small UI polish, single-file fixes
- `1`: small scoped change in one layer with straightforward tests
- `2`: moderate change across one feature slice, usually backend plus frontend or backend plus tests
- `3`: larger feature slice with multiple touchpoints, migration risk, or careful regression testing
- `5+`: broad or uncertain work that should usually be split before implementation

When uncertain, round up rather than down.

## Effective Size Conventions

The board does not currently have a `Size` field, but use these internal labels when planning or drafting issues:

- `S`: one bounded change in a single layer or a small end-to-end fix
- `M`: one end-to-end feature slice touching two layers, usually still reviewable in one PR
- `L`: multi-step feature work, multiple pages or controllers, or non-trivial refactor risk
- `XL`: cross-cutting work spanning several flows, packages, or architectural seams

## Split Threshold

Default split policy for this repository:

- Review for splitting when the effective size is `L` or the estimate is `3` days or more.
- Split by default when the effective size is `XL`, the estimate is `5` days or more, or the work spans more than one independently testable user flow.
- Prefer split boundaries along feature slices or dependency seams:
  - backend contract first, UI follow-up
  - auth or policy groundwork first, feature integration follow-up
  - shared component extraction first, page adoption follow-up

Do not split work into issues that are not independently reviewable or shippable. Each split issue should have:

- a clear deliverable
- its own acceptance criteria
- its own validation steps
- explicit blocker links when it cannot start immediately

## Priority Guidance

The board does not currently have a `Priority` field. Use these labels in issue bodies or planning notes when useful:

- `P0`: production bug, broken auth or core workflow, or work blocking active delivery
- `P1`: core product feature, workflow-critical refactor, or enabling platform work
- `P2`: useful but non-blocking enhancement, cleanup, or follow-up
- `P3`: low-urgency polish or deferred improvement

Default conservatively. Do not mark work `P0` unless delay is actively harmful.

## Dependency Rules

- Check blockers across all open non-Done issues, not only backlog items.
- Treat `In progress` issues as real blockers when a new issue depends on their output.
- Prefer explicit blocker links over implied sequencing in prose.
- Avoid circular issue dependencies. If two tasks must move together, they were probably split incorrectly.

## Dashboard Rules

When summarizing project status:

- group by `status_order`
- keep `Done` compact by default
- call out blocked items separately from merely queued items
- show backlog estimate total and untriaged count when useful

## Operational Notes

- `gh auth status` is currently not healthy in this environment, so future `gh`-driven project mutations will require the user to re-authenticate with `gh auth login` and likely `gh auth refresh -s project`.
- The project metadata in this file was initialized from repository-local context plus the existing `.gh-symphony/context.yaml`.
