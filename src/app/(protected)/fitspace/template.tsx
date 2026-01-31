/**
 * Template component for fitspace routes.
 *
 * Removed animations for instant page transitions (feels faster/more native).
 * Template still re-renders on navigation which can be useful for resetting state.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
