---
name: self-learning
description: Captures user corrections and preferences, storing them in appropriate rule files for future sessions. Use when user corrects code patterns, UI/UX decisions, or says "remember this", "learn this", "note this pattern".
---

# Self-Learning System

## When This Skill Activates

### Automatic Detection

Recognize correction signals in user messages:

- "No, do it like this instead..."
- "This is too complicated, simplify..."
- "Split this into smaller components"
- "Use X pattern instead of Y"
- "The UX should be..."
- "I prefer..."
- "Always do X" / "Never do Y"
- "This is wrong because..."

### Explicit Triggers

Respond immediately when user says:

- "remember this"
- "learn this"
- "note this pattern"
- "add this to rules"
- "save this preference"

## Workflow

### Step 1: Detect Correction

When user provides feedback that implies a preference or correction:

1. Acknowledge the correction
2. Apply the fix immediately
3. Ask: **"Should I remember this for future sessions?"**

Skip asking if user already said "remember this" or similar - proceed directly.

### Step 2: Categorize the Correction

Determine the correction type:

| Category           | Keywords/Signals                           |
| ------------------ | ------------------------------------------ |
| Component patterns | Button, Card, props, icons, loading states |
| Code structure     | split, hooks, extract, lines, complexity   |
| Data layer         | mutation, query, optimistic, cache         |
| Design system      | colors, spacing, tokens, Tailwind          |
| UI/UX mobile       | mobile, fitspace, touch, gestures          |
| General preference | anything else, personal style              |

### Step 3: Format as Rule

Convert the correction into a concise rule:

```markdown
- **Prefer**: [What to do] - [Brief reason if helpful]
- **Avoid**: [What not to do]
```

Examples:

```markdown
- **Prefer**: Extract to hooks when component reaches 100 lines
- **Avoid**: Inline handlers longer than 2 lines
- **Prefer**: Simple confirm dialogs over bottom sheets for destructive actions
```

### Step 4: Store in Appropriate File

Route to the correct rule file based on category:

| Category           | Target File                                        |
| ------------------ | -------------------------------------------------- |
| Component patterns | `.cursor/rules/component-usage-rules.mdc`          |
| Code structure     | `.cursor/rules/hypertro-code-standards.mdc`        |
| Data layer         | `.cursor/rules/hypertro-data-layer.mdc`            |
| Design system      | `.cursor/rules/hypertro-design-system.mdc`         |
| UI/UX mobile       | `.cursor/skills/fitspace-mobile-first/patterns.md` |
| General preference | `.cursor/rules/learned-preferences.mdc`            |

### Step 5: Append the Rule

Add the new rule to the appropriate section in the target file.

If no matching section exists, create a `## Learned Preferences` section at the end.

Format for appending:

```markdown
## Learned Preferences

### [Category Name]

- **Prefer**: ...
- **Avoid**: ...
```

## Example Flow

**User**: "No, this modal is too complex. Just use a simple confirm dialog for delete actions."

**Agent response**:

1. "Got it, I'll simplify to a confirm dialog."
2. [Makes the change]
3. "Should I remember this for future sessions?"

**User**: "Yes"

**Agent**:

1. Categorizes as UI/UX
2. Formats: `- **Prefer**: Simple confirm dialogs for delete actions over complex modals`
3. Appends to `.cursor/rules/learned-preferences.mdc` under `### UI/UX`
4. Confirms: "Added to learned preferences."

## Rules for This Skill

- Keep rules concise (one line each)
- Include context only when the rule would be ambiguous without it
- Don't duplicate existing rules - check first
- Group related preferences together
- Use **Prefer**/**Avoid** format consistently
