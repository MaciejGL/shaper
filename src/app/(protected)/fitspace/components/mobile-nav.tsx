'use client'

import {
  Calendar,
  ChefHatIcon,
  Compass,
  Dumbbell,
  LayoutDashboardIcon,
  MoreHorizontalIcon,
  PersonStanding,
  SaladIcon,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Icon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useFitspaceGetActivePlanIdQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { AddMeasurementModal } from '../progress/components/add-measurement-modal'
import { MeasurementFieldEnum } from '../progress/components/measurement-constants'

export function MobileNav() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [clickedItem, setClickedItem] = useState<string | null>(null)
  const { data, isLoading } = useFitspaceGetActivePlanIdQuery()

  const currentWorkoutId = data?.getActivePlanId
  useEffect(() => {
    setClickedItem(null)
  }, [pathname])

  const navItems = useMemo(
    () => [
      {
        href: '/fitspace/dashboard',
        icon: LayoutDashboardIcon,
        label: 'Dash',
        prefetch: true,
      },
      {
        href: '/fitspace/my-plans',
        icon: Calendar,
        label: 'Plans',
        prefetch: true,
      },
      {
        href: `/fitspace/workout/${currentWorkoutId || 'quick-workout'}`,
        icon: Dumbbell,
        label: 'Workout',
        prefetch: true,
        disabled: isLoading,
      },
      {
        href: '/fitspace/meal-plan',
        icon: SaladIcon,
        label: 'Food',
        prefetch: true,
      },
      {
        href: '/fitspace/progress',
        icon: TrendingUp,
        label: 'Progress',
        disabled: true,
        prefetch: true,
      },
      {
        icon: MoreHorizontalIcon,
        label: 'More',
        prefetch: true,
        onClick: () => {
          setIsMoreOpen(true)
        },
      },
    ],
    [currentWorkoutId, isLoading],
  )

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar rounded-t-lg">
        <div className="grid grid-cols-6 items-center py-2 px-2 max-w-md mx-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isClicked = clickedItem === item.label && !isActive
            const isHighlighted = isActive || isClicked

            if (item.onClick) {
              return (
                <button
                  key={item.href || item.label}
                  onClick={item.onClick}
                  className={cn(
                    'flex flex-col text-muted-foreground hover:text-foreground items-center justify-center p-2 rounded-xl transition-colors min-w-[40px] cursor-pointer',
                    isMoreOpen && 'text-primary bg-zinc-200 dark:bg-zinc-800',
                  )}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href || item.label}
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
                <Icon className="h-5 w-5 mb-1" />
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
            <div className="flex flex-wrap gap-4">
              <ButtonLink
                onClick={() => onOpenChange(false)}
                href="/fitspace/explore"
                variant="secondary"
                className="size-20"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Compass className="size-6" />
                  <p className="text-xs font-medium">Explore</p>
                </div>
              </ButtonLink>

              <ButtonLink
                onClick={() => onOpenChange(false)}
                href="/fitspace/my-trainer"
                variant="secondary"
                className="size-20"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <UserCheck className="size-6" />
                  <p className="text-xs font-medium">My Trainer</p>
                </div>
              </ButtonLink>

              <ButtonLink
                onClick={() => onOpenChange(false)}
                href="/fitspace/meal-plans"
                variant="secondary"
                className="size-20"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <ChefHatIcon className="size-6" />
                  <p className="text-xs font-medium">Meal Plans</p>
                </div>
              </ButtonLink>

              <DrawerMeasurement />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function DrawerMeasurement() {
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
    <>
      <AddMeasurementModal showFields={weightFields} title="Add Weight">
        <Button variant="secondary" className="size-20">
          <div className="flex flex-col items-center justify-center gap-2 text-xs">
            <Icon name="scale" />
            <span className="text-xs whitespace-pre-wrap">Log Weight</span>
          </div>
        </Button>
      </AddMeasurementModal>

      <AddMeasurementModal showFields={allFields} title="Add All">
        <Button variant="secondary" className="size-20">
          <div className="flex flex-col items-center justify-center gap-2 text-xs">
            <PersonStanding />
            <span className="text-xs whitespace-pre-wrap">Log Measures</span>
          </div>
        </Button>
      </AddMeasurementModal>
    </>
  )
}
