import { AnimatedLogo } from '@/components/animated-logo'

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="h-dvh w-dvw bg-black">
      <div className="flex flex-col gap-4 items-center justify-center h-full">
        <AnimatedLogo infinite={false} size={192} forceColor="text-white" />
      </div>
    </div>
  )
}
