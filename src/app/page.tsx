import { redirect } from 'next/navigation'

import { HomepageClient } from '@/components/homepage.client'
import { GQLUserRole } from '@/generated/graphql-client'
import { getCurrentUser } from '@/lib/getUser'

export default async function Home() {
  const user = await getCurrentUser()
  if (user?.user.role === GQLUserRole.Trainer) {
    return redirect('/trainer/dashboard')
  } else if (user?.user.role === GQLUserRole.Client) {
    return redirect('/fitspace/dashboard')
  }
  return <HomepageClient />
}
