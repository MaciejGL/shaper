---
name: feature-ideation-planning
description: Guides brainstorming and planning new features by researching the existing codebase, defining user value, and writing minimal-change specs. Use when planning or scoping new features, drafting requirements, or exploring what already exists before making changes.
---

# Feature Ideation Planning

## Quick Start

Use this workflow to turn a feature idea into a simple, high-value plan while
reusing existing code and avoiding unnecessary rewrites.

## Core Principles

- Prefer minimal changes over new systems.
- Prove ideas with codebase evidence before proposing changes.
- Optimize for simple, high-value UX.
- Reuse existing flows, components, and data where possible.
- Avoid replacing core features unless there is clear user harm.

## Workflow Checklist

1. **Problem + user**: State the user segment and the job-to-be-done.
2. **Evidence scan**: Locate related code, flows, and data.
3. **What already works**: Identify existing paths that solve part of the need.
4. **Pain points**: List the smallest set of issues blocking value.
5. **Options**: Propose 1-3 minimal-change solutions.
6. **Value focus**: Choose the option with the best value-to-effort ratio.
7. **Spec**: Write a small, clear spec with scope and non-goals.
8. **Plan**: Outline a short implementation path that reuses existing assets.

## Discovery Questions

- Who is the primary user and what is the exact pain?
- What is the smallest meaningful improvement?
- What already exists in the codebase that we can reuse?
- Which parts are working well and should stay unchanged?
- What data flows or UI patterns already match this problem?
- What is the simplest UX that delivers value?
- What should explicitly be out of scope for now?

## Evidence-First Exploration

- Search for existing routes, components, and hooks tied to the problem.
- Inspect current UX flows and identify friction points.
- Note what is already reliable and should not be replaced.
- Document concrete file paths and functions as evidence.

## Spec Template

Use this format for the final planning output:

```
Feature: [short name]

Problem
- [Who is affected and what is the pain]

Goals
- [1-3 measurable outcomes]

Non-goals
- [What we will NOT do in this iteration]

Existing assets to reuse
- [Files, components, hooks, data flows]

Minimal-change approach
- [Why this is the smallest valuable change]

Proposed solution
- [Short description of the UX and behavior]

Risks / assumptions
- [Call out any assumptions; validate in code]

Implementation plan
- [3-6 concise steps, reusing existing code]
```

## Output Expectations

- Keep it simple and user-value focused.
- Use concrete evidence from the codebase.
- Avoid speculative or large-scope rewrites.
- Document assumptions when evidence is missing.
