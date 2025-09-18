# Hypertro Design System Standards

## UI Components

- Use shadcn/ui components from `src/components/ui/`
- Follow the design tokens defined in `components.json`
- Maintain consistency with existing component patterns
- Use proper accessibility attributes (ARIA labels, roles, etc.)

## Styling Standards

- Use Tailwind CSS for styling
- Follow the theme configuration in `tailwind.config.js`
- Use CSS variables for dynamic theming
- Implement proper dark/light mode support
- Use consistent spacing and typography scales

## Component Architecture

- Create reusable, composable components
- Use proper prop interfaces with TypeScript
- Implement proper default props and prop validation
- Follow the compound component pattern where appropriate
- Use render props or children functions for flexibility

## Responsive Design

- Mobile-first approach with proper breakpoints
- Test on various screen sizes and devices
- Use proper touch targets for mobile interactions
- Implement proper keyboard navigation
- Consider both web and mobile app contexts

## Animation & Interactions

- Use Framer Motion for complex animations
- Implement proper loading states and transitions
- Follow accessibility guidelines for animations
- Use proper easing functions and timing
- Consider reduced motion preferences

## Icons & Assets

- Use consistent icon library (Lucide React)
- Optimize images and assets for performance
- Use proper alt text for accessibility
- Implement proper image loading strategies
- Use SVGs for scalable graphics

## Theme Management

- Support both light and dark themes
- Use CSS custom properties for theme values
- Implement proper theme switching
- Consider user preferences and system settings
- Maintain theme consistency across components
