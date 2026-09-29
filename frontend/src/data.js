// App configuration only. All displayed metrics come from the backend
// (see src/lib/selectors.js); there is no hardcoded sample data here.

// Sidebar navigation (see dashboard_integration_guide.md §2A).
export const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'command', end: true },
  { to: '/dashboard/surveillance', label: 'Health Surveillance', icon: 'pulse' },
  { to: '/dashboard/logistics', label: 'Logistics & Supply', icon: 'truck' },
  { to: '/dashboard/inventory', label: 'Inventory', icon: 'inventory' },
  { to: '/dashboard/education', label: 'Education', icon: 'lms' },
  { to: '/dashboard/assistant', label: 'AI Assistant', icon: 'chat' },
]

// Example regions offered on onboarding.
export const REGION_EXAMPLES = ['Pune', 'Mumbai', 'Lucknow', 'Barabanki, Uttar Pradesh', 'Patna']
