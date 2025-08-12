import { redirect } from 'next/navigation'

// Simple redirect for PWA start_url '/fitspace'
// Auth is already handled by the (protected) layout
export default function FitspacePage() {
  redirect('/fitspace/dashboard')
}
