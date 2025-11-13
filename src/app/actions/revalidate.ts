'use server'

import { revalidatePath } from 'next/cache'

export async function revalidatePlanPages() {
  revalidatePath('/fitspace/workout')
  revalidatePath('/fitspace/my-plans')
  revalidatePath('/fitspace/my-trainer')
}
