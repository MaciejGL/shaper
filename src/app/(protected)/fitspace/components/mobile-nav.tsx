'use client'

import {
  Calendar,
  ChevronRight,
  Dumbbell,
  PersonStanding,
  SaladIcon,
  SearchIcon,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Icon } from '@/components/icons'
import { TrainerDiscoveryCta } from '@/components/trainer-discovery-cta'
import { ButtonLink } from '@/components/ui/button-link'
import { Card } from '@/components/ui/card'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import {
  useFitspaceGetActivePlanIdQuery,
  useFitspaceGetUserQuickWorkoutPlanQuery,
} from '@/generated/graphql-client'
import { useTrainerStatus } from '@/hooks/use-trainer-status'
import { cn } from '@/lib/utils'

import { AddMeasurementModal } from '../progress/components/add-measurement-modal'
import { MeasurementFieldEnum } from '../progress/components/measurement-constants'

export function MobileNav() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [clickedItem, setClickedItem] = useState<string | null>(null)
  const { data, isLoading } = useFitspaceGetActivePlanIdQuery()
  const { data: quickWorkoutPlanData, isLoading: isQuickWorkoutPlanLoading } =
    useFitspaceGetUserQuickWorkoutPlanQuery({})
  const { hasTrainer } = useTrainerStatus()

  const currentWorkoutId =
    data?.getActivePlanId || quickWorkoutPlanData?.getQuickWorkoutPlan?.id
  useEffect(() => {
    setClickedItem(null)
  }, [pathname])

  const navItems = useMemo(
    () => [
      {
        id: 'workout',
        href: currentWorkoutId
          ? `/fitspace/workout/${currentWorkoutId}`
          : '/fitspace/my-plans',
        icon: Dumbbell,
        label: 'Workout',
        prefetch: true,
        disabled: isLoading || isQuickWorkoutPlanLoading,
      },
      {
        id: 'plans',
        href: '/fitspace/my-plans',
        icon: Calendar,
        label: 'Plans',
        prefetch: true,
      },
      {
        id: 'meals',
        href: '/fitspace/meal-plan',
        icon: SaladIcon,
        label: 'Meals',
        prefetch: true,
      },
      {
        id: 'progress',
        href: '/fitspace/progress',
        icon: TrendingUp,
        label: 'Progress',
        prefetch: true,
      },
      {
        id: 'trainer',
        href: hasTrainer
          ? '/fitspace/my-trainer'
          : '/fitspace/explore?tab=trainers',
        icon: UserCheck,
        label: 'Trainer',
        prefetch: true,
      },
      {
        id: 'discover',
        href: '/fitspace/explore',
        icon: SearchIcon,
        label: 'Discover',
        prefetch: true,
      },
    ],
    [currentWorkoutId, isLoading, isQuickWorkoutPlanLoading, hasTrainer],
  )

  return (
    <>
      <div className="h-[4.5rem]" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar safe-area-bottom safe-area-x">
        <div className="grid grid-cols-6 items-center py-2 px-2 max-w-md mx-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isClicked = clickedItem === item.label && !isActive
            const isHighlighted = isActive || isClicked

            // if (item.onClick) {
            //   return (
            //     <button
            //       key={item.id}
            //       onClick={item.onClick}
            //       className={cn(
            //         'flex flex-col text-muted-foreground hover:text-foreground items-center justify-center p-2 rounded-xl transition-colors min-w-[40px] cursor-pointer',
            //         isMoreOpen && 'text-primary bg-zinc-200 dark:bg-zinc-800',
            //       )}
            //     >
            //       <Icon className="h-5 w-5 mb-1" />
            //       <span className="text-xs font-medium">{item.label}</span>
            //     </button>
            //   )
            // }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setClickedItem(item.label)}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                  isHighlighted
                    ? 'text-primary bg-zinc-200 dark:bg-zinc-800'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                prefetch={item.prefetch}
              >
                <Icon className="size-4 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <QuickActionDrawer isOpen={isMoreOpen} onOpenChange={setIsMoreOpen} />
    </>
  )
}

function QuickActionDrawer({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent dialogTitle="Quick Actions">
        <div className="p-4 space-y-4">
          <div>
            <div className="flex flex-col gap-4">
              <TrainerDiscoveryCta
                variant="banner"
                title="Explore Coaches & Plans"
                subtitle="Get matched to a coach or start a plan"
                onClick={() => onOpenChange(false)}
              />

              <div className="space-y-2">
                <h3 className="text-md font-medium">Progress</h3>
                <DrawerMeasurement onOpenChange={() => onOpenChange(false)} />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function DrawerMeasurement({ onOpenChange }: { onOpenChange: () => void }) {
  const weightFields: MeasurementFieldEnum[] = [
    MeasurementFieldEnum.Weight,
    MeasurementFieldEnum.BodyFat,
    MeasurementFieldEnum.Notes,
  ]
  const circumferencesFields: MeasurementFieldEnum[] = [
    MeasurementFieldEnum.Chest,
    MeasurementFieldEnum.Neck,
    MeasurementFieldEnum.Waist,
    MeasurementFieldEnum.Hips,
    MeasurementFieldEnum.Notes,
  ]
  const armsLegsFields: MeasurementFieldEnum[] = [
    MeasurementFieldEnum.BicepsLeft,
    MeasurementFieldEnum.BicepsRight,
    MeasurementFieldEnum.ThighLeft,
    MeasurementFieldEnum.ThighRight,
    MeasurementFieldEnum.CalfLeft,
    MeasurementFieldEnum.CalfRight,
    MeasurementFieldEnum.Notes,
  ]

  const allFields = [
    ...weightFields,
    ...circumferencesFields,
    ...armsLegsFields,
  ]
  return (
    <div className="grid grid-cols-3 gap-2">
      <QuickActionTile
        href="/fitspace/progress"
        label="Progress"
        icon={TrendingUp}
        onClick={onOpenChange}
      />

      <AddMeasurementModal showFields={weightFields} title="Add Weight">
        <QuickActionTile
          href="#"
          label="Log Weight"
          icon={() => <Icon name="scale" />}
          ariaLabel="Log Weight"
        />
      </AddMeasurementModal>

      <AddMeasurementModal showFields={allFields} title="Add All">
        <QuickActionTile
          href="#"
          label="Log Measures"
          icon={PersonStanding}
          ariaLabel="Log Measures"
        />
      </AddMeasurementModal>
    </div>
  )
}

type ExploreCtaButtonProps = {
  href: string
  onClick?: () => void
  title?: string
  subtitle?: string
  className?: string
}

export function ExploreCtaButton({
  href,
  onClick,
  title = 'Explore Coaches & Plans',
  subtitle = 'Get matched to a coach or start a plan',
  className,
}: ExploreCtaButtonProps) {
  return (
    <Link href={href} onClick={onClick} aria-label={title}>
      <Card
        variant="premium"
        className={cn(
          'w-full flex flex-row items-center justify-between p-4',
          className,
        )}
      >
        <div className="flex items-center gap-3 text-black">
          <div className="text-left">
            <div className="text-base font-semibold leading-tight">{title}</div>
            <div className="text-xs leading-tight">{subtitle}</div>
          </div>
        </div>
        <ChevronRight className="size-5" color="black" />
      </Card>
    </Link>
  )
}

type QuickActionTileProps = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  ariaLabel?: string
  disabled?: boolean
  className?: string
}

export function QuickActionTile({
  href,
  label,
  icon: Icon,
  onClick,
  ariaLabel,
  disabled,
  className,
}: QuickActionTileProps) {
  return (
    <ButtonLink
      href={disabled ? '#' : href}
      onClick={disabled ? undefined : onClick}
      variant="secondary"
      aria-label={ariaLabel || label}
      disabled={disabled}
      className={cn('h-24 rounded-xl', className)}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <Icon className={cn(disabled && 'opacity-50')} />
        <p
          className={cn(
            'text-xs font-medium text-center whitespace-pre-wrap',
            disabled && 'opacity-50',
          )}
        >
          {label}
        </p>
      </div>
    </ButtonLink>
  )
}
