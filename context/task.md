# Task: [Feature Name]

## Source

- **Project Overview**: `context/project-overview.md`
- **Feature Overview**: `context/feature-spec/feature-overview.md`
- **Architecture**: `context/architecture.md`
- **UI Context**: `context/ui-context.md`
- **Code Standards**: `context/code-standards.md`
- **Progress Tracker**: `context/feature-spec/*-progress-tracker.md`

## Objective

[Describe the feature outcome in one short paragraph. Focus on
what the user or system should be able to do when this task is
complete.]

## Background

[Add any important product, technical, or business context needed
to understand why this feature exists and how it should behave.]

## Scope

### In Scope

- [Specific behavior, screen, service, route, component, or workflow
  to build or update]
- [Specific behavior, screen, service, route, component, or workflow
  to build or update]
- [Any required documentation or tracker update]

### Out of Scope

- [Related work that should not be included in this task]
- [Future enhancement or separate feature]
- [Any files, flows, or system boundaries to avoid]

## What to Implement

### 1. [Implementation Area One]

- [Concrete change to make]
- [Data, state, API, UI, or validation behavior required]
- [Edge case or constraint to preserve]

### 2. [Implementation Area Two]

- [Concrete change to make]
- [Data, state, API, UI, or validation behavior required]
- [Edge case or constraint to preserve]

### 3. Documentation and Progress

- Update `context/feature-spect/*-progress-tracker.md` after meaningful implementation
  changes.
- Add any discovered architecture decisions or open questions to the
  relevant context file.
- Keep this task file aligned with the final implemented scope.

## Files or Areas to Inspect

1. `[file/path/or/module]`
2. `[file/path/or/module]`
3. `[file/path/or/module]`

## Data and Contracts

- **Inputs**: [User input, API payload, route params, database records,
  queue item, file format, or other source data]
- **Outputs**: [UI state, API response, persisted record, generated file,
  event, log, or other result]
- **Validation Rules**: [Required fields, constraints, permissions,
  error states, or fallback behavior]
- **Compatibility Requirements**: [Existing behavior, public contract,
  migration note, or backward compatibility concern]

## UX Requirements

- [Expected user flow or interaction]
- [Loading, empty, error, and success states]
- [Responsive behavior or accessibility requirement]

## Technical Constraints

- Follow the patterns already established in the nearby code.
- Keep the change limited to the smallest practical system boundary.
- Do not introduce new dependencies unless the feature clearly requires
  them.
- Preserve existing tests and behavior unless this task explicitly
  changes them.

## Methods or Entry Points to Inspect

1. `[function/component/route/service]`
2. `[function/component/route/service]`
3. `[function/component/route/service]`

## Acceptance Criteria

1. [Specific, verifiable condition that proves the core behavior works]
2. [Specific, verifiable condition for an edge case or important state]
3. [Specific, verifiable condition for data, API, UI, or persistence]
4. [Relevant tests, build, lint, or manual verification pass]
5. `context/feature-spec/*-progress-tracker.md` is updated with completed work, open
   questions, and next steps.

## Verification Plan

- [Command to run, e.g. `yarn run build`]
- [Command to run, e.g. `yarn test`]
- [Manual verification step, e.g. create a record and confirm it appears
  in the target view]

## Open Questions

- [Decision needed before or during implementation]
- [Missing requirement to clarify]
