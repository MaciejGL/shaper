'use client'

import {
  Calendar,
  ChefHatIcon,
  ChevronRight,
  Dumbbell,
  LayoutDashboardIcon,
  MoreHorizontalIcon,
  Notebook,
  PersonStanding,
  SaladIcon,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Icon } from '@/components/icons'
import { ButtonLink } from '@/components/ui/button-link'
import { Card } from '@/components/ui/card'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar rounded-t-lg safe-area-bottom safe-area-x">
        <div className="grid grid-cols-5 items-center py-2 px-2 max-w-md mx-auto gap-1">
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
  const { user } = useUser()
  const hasTrainer = Boolean(user?.trainer?.id)

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent dialogTitle="Quick Actions">
        <div className="p-4 space-y-4">
          <div>
            <div className="flex flex-col gap-4">
              <ExploreCtaButton
                href="/fitspace/explore"
                onClick={() => onOpenChange(false)}
              />

              <div className="space-y-2">
                <h3 className="text-md font-medium">Coach & Plans</h3>
                <div className="grid grid-cols-3 gap-2">
                  <QuickActionTile
                    href={
                      hasTrainer ? '/fitspace/my-trainer' : '/fitspace/explore'
                    }
                    label={hasTrainer ? 'My Trainer' : 'Find a Trainer'}
                    icon={UserCheck}
                    onClick={() => onOpenChange(false)}
                  />
                  <QuickActionTile
                    href="/fitspace/my-plans"
                    label="Training Plans"
                    icon={Notebook}
                    onClick={() => onOpenChange(false)}
                  />
                  <QuickActionTile
                    href="/fitspace/meal-plans"
                    label="Meal Plans"
                    icon={ChefHatIcon}
                    onClick={() => onOpenChange(false)}
                  />
                </div>
              </div>
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
        <div>
          <QuickActionTile
            href="#"
            label="Log Weight"
            icon={() => <Icon name="scale" />}
            onClick={() => {}}
            ariaLabel="Log Weight"
          />
        </div>
      </AddMeasurementModal>

      <AddMeasurementModal showFields={allFields} title="Add All">
        <div>
          <QuickActionTile
            href="#"
            label="Log Measures"
            icon={PersonStanding}
            onClick={() => {}}
            ariaLabel="Log Measures"
          />
        </div>
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
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-base font-semibold leading-tight">{title}</div>
            <div className="text-xs leading-tight">{subtitle}</div>
          </div>
        </div>
        <ChevronRight className="size-5 text-primary opacity-90" />
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
      href={href}
      onClick={onClick}
      variant="secondary"
      aria-label={ariaLabel || label}
      disabled={disabled}
      className={cn('h-24 rounded-xl border', className)}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <Icon />
        <p className="text-xs font-medium text-center whitespace-pre-wrap">
          {label}
        </p>
      </div>
    </ButtonLink>
  )
}
