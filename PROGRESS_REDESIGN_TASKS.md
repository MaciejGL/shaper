# Progress Page Redesign - Task Breakdown

## Overview

Redesign the existing progress page to make it simpler and more user-friendly with 4 main sections.

## Phase 1: Task Planning ✅

- [x] Analyze current progress page structure
- [x] Create task breakdown document
- [x] Define component architecture

## Phase 2: Placeholder Components ✅

### 1. Latest PRs Section ✅

- [x] Create `LatestPRs` component with placeholder content
- [x] Show this and last week's PRs with "View More" button
- [x] Add drawer for "View More" showing all PRs divided by weeks
- [x] Use existing PR data structure from `useGetUserPrHistoryQuery`

### 2. Logs Section ✅

- [x] Create `LogsSection` component with weight progress graph
- [x] Add "Add Log" button functionality
- [x] Add "View More" button for detailed view
- [x] Create drawer with human body SVG and muscle badges - use existing front body svg body-front.tsx
- [x] Implement muscle progress overview with quick add log
- [x] Reuse `EnhancedBodyView` component from existing muscle selector

### 3. Snapshots Section ✅

- [x] Create `SnapshotsSection` component
- [x] Show last snapshot and previous snapshot for comparison
- [x] Add "Add New Snapshot" functionality
- [x] Add "View Timeline" button opening drawer with all snapshots
- [x] Implement timeline view with image comparison

### 4. Heatmap Section ✅

- [x] Create `MuscleHeatmapSection` component
- [x] Use human body SVG with heatmap highlighting body-front.tsx
- [x] Add radial graph for muscle focus visualization - we already have one, reuse it.

## Phase 3: Data Integration & Full Functionality

### Data Fetching

- [ ] Integrate with existing GraphQL queries
- [ ] Add new queries for snapshot data if needed
- [ ] Implement muscle progress tracking queries
- [ ] Add PR history with weekly grouping

### Component Implementation

- [ ] Replace placeholder content with real data
- [ ] Add optimistic updates for all mutations
- [ ] Implement proper loading states
- [ ] Add error handling
- [ ] Ensure mobile responsiveness

### Advanced Features

- [ ] Add muscle progress calculations
- [ ] Implement snapshot comparison logic
- [ ] Create heatmap intensity algorithms
- [ ] Add export functionality for progress data

## Technical Requirements

- Use existing design system components
- Follow component usage rules (Button props, Card usage, etc.)
- Keep components under 200 lines
- Extract logic to custom hooks
- Use optimistic updates for mutations
- Implement proper TypeScript types
- Follow mobile-first design principles

## File Structure

```
src/app/(protected)/fitspace/progress/
├── page.tsx (main page)
├── components/
│   ├── latest-prs/
│   │   ├── latest-prs.tsx
│   │   ├── prs-drawer.tsx
│   │   └── use-latest-prs.ts
│   ├── logs-section/
│   │   ├── logs-section.tsx
│   │   ├── muscle-logs-drawer.tsx
│   │   └── use-logs-data.ts
│   ├── snapshots-section/
│   │   ├── snapshots-section.tsx
│   │   ├── snapshot-timeline-drawer.tsx
│   │   └── use-snapshots.ts
│   └── muscle-heatmap/
│       ├── muscle-heatmap-section.tsx
│       ├── heatmap-body-view.tsx
│       └── use-muscle-heatmap.ts
```

## Success Criteria

- [ ] Page loads faster than current implementation
- [ ] All 4 sections are clearly visible and functional
- [ ] Mobile experience is smooth and intuitive
- [ ] Data updates are immediate (optimistic updates)
- [ ] Users can easily track progress across all metrics
- [ ] Code follows established patterns and standards
