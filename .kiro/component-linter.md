# Component Pattern Linter

## 🔍 Regex Patterns to Find Issues

### Button Anti-Patterns

```bash
# Find buttons with icon children (need to use iconStart/iconEnd/iconOnly)
grep -r "<Button[^>]*>.*<\w*Icon" src/ --include="*.tsx"

# Find buttons with manual gap/flex classes
grep -r "className.*flex.*gap" src/ --include="*.tsx" | grep Button

# Find buttons with manual margin on icons
grep -r "className.*m[rlt]-" src/ --include="*.tsx" | grep -B2 -A2 Icon
```

### Card Overuse Patterns

```bash
# Find borderless cards (candidates for simple divs)
grep -r "borderless" src/ --include="*.tsx"

# Find cards with minimal content (might not need cards)
grep -r "<Card>" -A5 src/ --include="*.tsx" | grep -B5 -A5 "className=\"p-"

# Find nested cards
grep -r "<Card>" -A10 src/ --include="*.tsx" | grep "<Card>"
```

### Component Length Issues

```bash
# Find files with >300 lines (definitely too long)
find src/ -name "*.tsx" -exec wc -l {} \; | awk '$1 > 300 {print $2 " (" $1 " lines)"}' | sort -nr

# Find files with >200 lines (review candidates)
find src/ -name "*.tsx" -exec wc -l {} \; | awk '$1 > 200 {print $2 " (" $1 " lines)"}' | sort -nr
```

## 🛠️ Quick Fix Commands

### Button Icon Fixes

```bash
# Search and replace common patterns (use with caution)

# Pattern 1: <Button><Icon className="mr-2" />Text</Button>
# Manual replacement needed - convert to iconStart

# Pattern 2: <Button className="flex items-center gap-2">
# Remove the className, use iconStart prop instead
```

### Common Anti-Pattern Examples

```typescript
// ❌ These patterns indicate issues:

// 1. Button with icon children
<Button className="flex items-center gap-2">
  <PlusIcon className="h-4 w-4" />
  Add
</Button>

// 2. Card used as simple container
<Card borderless>
  <div className="p-4">Simple content</div>
</Card>

// 3. Manual icon sizing/spacing
<Button>
  <EditIcon className="h-4 w-4 mr-2" />
  Edit
</Button>

// 4. Components over 200 lines
export function MassiveComponent() {
  // 300+ lines of code
}
```

## 📊 Health Check Script

```bash
#!/bin/bash
# component-health-check.sh

echo "🔍 Component Health Check"
echo "========================="

echo ""
echo "📏 Component Length Issues:"
find src/ -name "*.tsx" -exec wc -l {} \; | awk '$1 > 200 {print "  ⚠️  " $2 " (" $1 " lines)"}' | head -10

echo ""
echo "🔘 Button Icon Issues:"
grep -r "<Button[^>]*>.*<\w*Icon" src/ --include="*.tsx" | wc -l | awk '{print "  Found " $1 " potential button icon issues"}'

echo ""
echo "🃏 Card Overuse Issues:"
grep -r "borderless" src/ --include="*.tsx" | wc -l | awk '{print "  Found " $1 " borderless cards (review needed)"}'

echo ""
echo "🎯 Manual Flex/Gap Classes on Buttons:"
grep -r "className.*flex.*gap" src/ --include="*.tsx" | grep Button | wc -l | awk '{print "  Found " $1 " buttons with manual flex classes"}'

echo ""
echo "✅ Run this script regularly to catch issues early!"
```

## 🎯 Priority Fix Order

1. **High Priority**: Button icon usage (impacts many components)
2. **Medium Priority**: Card overuse (affects design consistency)
3. **Low Priority**: Component length (ongoing refactoring)
4. **Ongoing**: Use design system tokens consistently

## 🔧 Automated Fixes (Future)

Consider adding ESLint rules for:

```javascript
// .eslintrc.js additions
{
  "rules": {
    // Custom rule: no icon children in Button components
    "no-button-icon-children": "error",

    // Custom rule: prefer iconStart/iconEnd props
    "prefer-button-icon-props": "warn",

    // Custom rule: max component length
    "max-component-lines": ["warn", 200]
  }
}
```

## 📈 Tracking Progress

Create a simple dashboard:

```bash
# Track improvements over time
echo "$(date): $(grep -r '<Button[^>]*>.*<\w*Icon' src/ --include='*.tsx' | wc -l) button icon issues" >> .kiro/progress.log
```
