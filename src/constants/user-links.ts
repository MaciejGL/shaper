export const TRAINER_LINKS = {
  dashboard: {
    href: '/trainer/dashboard',
    label: 'Dashboard',
    disabled: false,
  },
  clients: { href: '/trainer/clients', label: 'Clients', disabled: false },
  trainings: { href: '/trainer/trainings', label: 'Trainings', disabled: true },
  mealPlans: {
    href: '/trainer/meal-plans',
    label: 'Meal Plans',
    disabled: false,
  },
  exercises: { href: '/trainer/exercises', label: 'Exercises', disabled: true },
  collaboration: {
    href: '/trainer/collaboration',
    label: 'Collaboration',
    disabled: false,
  },
  profile: { href: '/trainer/profile', label: 'Profile', disabled: false },
}

export const CLIENT_LINKS = {
  dashboard: {
    href: '/fitspace/dashboard',
    label: 'Dashboard',
  },
  myPlans: {
    href: '/fitspace/my-plans',
    label: 'Training Plans',
  },
  workout: {
    href: '/fitspace/workout',
    label: 'Workout',
  },
  progress: {
    href: '/fitspace/progress',
    label: 'Progress',
  },
  marketplace: {
    href: '/fitspace/marketplace',
    label: 'Explore',
  },
  profile: { href: '/fitspace/profile', label: 'Profile', disabled: false },
}
