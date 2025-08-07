import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { HomepageClient } from '@/components/homepage.client'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  let user
  try {
    user = await getServerSession(authOptions)
    console.log(user)
  } catch (error) {
    console.warn(error)
  }

  // Move redirect outside of try-catch block
  if (user?.user?.email) {
    return redirect('/fitspace/dashboard')
  }

  return <HomepageClient />
}
