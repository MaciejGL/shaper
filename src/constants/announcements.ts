export interface Announcement {
  id: string
  title: string
  content: string
  date: string // ISO date string
}

export const announcements: Announcement[] = [
  {
    id: '2025-01-20-v1',
    title: 'Thank You & Exciting Updates! 🚀',
    content:
      "Thank you so much for using our app! We're constantly working to make your fitness journey better with new features and bug fixes rolling out daily. Your feedback means everything to us - if you have any comments or suggestions, please share them with your trainer. We'd love to hear every bit of feedback, even the critical ones! 💪\n\nExciting news: Our new Messenger feature is now live! You can use it right away to contact your trainer directly through the app. We'll be testing and improving it over the upcoming days.\n\nWe're also planning to update the Meal Plans module soon with better functionality and user experience.\n\nA huge thank you for being with us during this early phase. As our way of showing appreciation, all early users will receive lifetime access to all premium features we're developing. We're committed to taking care of both the app and you to create the best possible experience! 🙏",
    date: '2025-01-20T00:00:00Z',
  },
]
