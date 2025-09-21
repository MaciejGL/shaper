# Component Usage Rules for AI Assistant

## 🎯 MANDATORY Component Patterns

### Button Component Rules

**ALWAYS use proper icon props:**

```typescript
// ✅ CORRECT
<Button iconStart={<Plus />}>Add Item</Button>
<Button iconEnd={<ArrowRight />}>Continue</Button>
<Button size="icon-md" iconOnly={<Edit />} />

// ❌ NEVER DO
<Button className="flex items-center gap-2">
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

**ALWAYS use loading prop:**

```typescript
// ✅ CORRECT
<Button loading={isLoading} disabled={isLoading}>Save</Button>

// ❌ NEVER DO
<Button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Save'}
</Button>
```

### Card Component Rules

**ONLY use Card for actual content containers:**

```typescript
// ✅ CORRECT - needs visual separation
<Card>
  <CardHeader>
    <CardTitle>Exercise Details</CardTitle>
  </CardHeader>
  <CardContent>Structured content</CardContent>
</Card>

// ❌ NEVER DO - use simple div instead
<Card borderless>
  <div className="p-4">
    <Button>Simple action</Button>
  </div>
</Card>
```

**Use borderless sparingly:**

```typescript
// ✅ ONLY when you need Card components but no visual styling
<Card borderless>
  <CardContent>Content that benefits from Card structure</CardContent>
</Card>

// ✅ BETTER - use simple container when possible
<div className="p-4 space-y-4">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

### Component Length Rules

- **NEVER create components over 200 lines**
- **ALWAYS extract logic to hooks when component gets long**
- **ALWAYS separate concerns into multiple files**

```typescript
// ✅ CORRECT structure
components/
  feature-name/
    feature-name.tsx      # < 200 lines
    use-feature-name.ts   # hooks/logic
    types.ts              # interfaces
    utils.ts              # helper functions
```

## 🚨 Anti-Patterns to NEVER Use

1. **Icons as Button children with manual spacing**
2. **Manual flexbox classes on Buttons (`className="flex items-center gap-2"`)**
3. **Cards for simple layout containers**
4. **Manual loading states instead of Button's loading prop**
5. **Components over 200 lines without extraction**
6. **Hardcoded colors instead of design system tokens**

## 🎯 Quick Component Checklist

Before creating/editing any component:

- [ ] Icons use proper Button props (iconStart/iconEnd/iconOnly)
- [ ] No manual spacing/flexbox on Buttons
- [ ] Cards only used for actual content containers
- [ ] Component under 200 lines
- [ ] Logic extracted to hooks if complex
- [ ] Uses design system tokens (bg-background, text-foreground, etc.)
- [ ] Optimistic updates for mutations

## 💡 When in Doubt

- **Button with icon?** → Use iconStart/iconEnd/iconOnly props
- **Need container?** → Try simple div before Card
- **Component getting long?** → Extract to hooks and separate files
- **Manual styling?** → Check if design system provides it

These rules are MANDATORY for all component creation and editing.
