'use client'

import {
  BicepsFlexed,
  Calendar,
  ChefHatIcon,
  Dumbbell,
  DumbbellIcon,
  LayoutDashboardIcon,
  MoreHorizontalIcon,
  NotepadText,
  PersonStanding,
  PlusIcon,
  SaladIcon,
  TrendingUp,
  UserRoundSearch,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Icon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

import { AddMeasurementModal } from '../progress/components/add-measurement-modal'
import { MeasurementFieldEnum } from '../progress/components/measurement-constants'

export function MobileNav({ currentWorkoutId }: { currentWorkoutId?: string }) {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [clickedItem, setClickedItem] = useState<string | null>(null)

  // Clear clicked item when pathname changes
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
    [currentWorkoutId],
  )

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar shadow-neuro-light dark:shadow-neuro-dark">
        <div className="grid grid-cols-6 items-center py-2 px-2 max-w-md mx-auto">
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
                  'flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[40px]',
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
            <p className="text-md font-medium mb-2">Meal Plan</p>
            <div className="grid grid-cols-2 gap-4">
              <ButtonLink
                href="/fitspace/meal-plans"
                onClick={() => onOpenChange(false)}
                variant="secondary"
                iconStart={<ChefHatIcon />}
              >
                Activate Meal Plan
              </ButtonLink>
              <ButtonLink
                onClick={() => onOpenChange(false)}
                href="/fitspace/meal-plans"
                variant="secondary"
                iconStart={<NotepadText />}
              >
                Meal Plans
              </ButtonLink>
            </div>
          </div>
          <div>
            <DrawerMeasurement />
          </div>
          <div>
            <p className="text-md font-medium mb-2">Explore</p>
            <div className="grid grid-cols-2 gap-4">
              <ButtonLink
                onClick={() => onOpenChange(false)}
                href="/fitspace/marketplace?tab=trainers"
                variant="secondary"
                iconStart={<UserRoundSearch />}
                disabled
                className="line-through"
              >
                Find Trainer
              </ButtonLink>
              <ButtonLink
                onClick={() => onOpenChange(false)}
                href="/fitspace/marketplace?tab=plans"
                variant="secondary"
                iconStart={<DumbbellIcon />}
                disabled
                className="line-through"
              >
                Find Plan
              </ButtonLink>
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
      <p className="text-md font-medium mb-2">Add logs</p>
      <div className="grid grid-cols-2 gap-4">
        <AddMeasurementModal showFields={weightFields} title="Add Weight">
          <Button
            variant="secondary"
            iconStart={<Icon name="scale" />}
            className="text-left justify-start"
          >
            Weight
          </Button>
        </AddMeasurementModal>
        <AddMeasurementModal
          showFields={circumferencesFields}
          title="Add Circumferences"
        >
          <Button
            variant="secondary"
            iconStart={<PersonStanding />}
            className="text-left justify-start"
          >
            Circumferences
          </Button>
        </AddMeasurementModal>
        <AddMeasurementModal
          showFields={armsLegsFields}
          title="Add Arms & Legs"
        >
          <Button
            variant="secondary"
            iconStart={<BicepsFlexed />}
            className="text-left justify-start"
          >
            Arms & Legs
          </Button>
        </AddMeasurementModal>
        <AddMeasurementModal showFields={allFields} title="Add All">
          <Button
            variant="secondary"
            iconStart={<PlusIcon />}
            className="text-left justify-start"
          >
            Log all
          </Button>
        </AddMeasurementModal>
      </div>
    </>
  )
}
