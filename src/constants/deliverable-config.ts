import { addDays, differenceInDays, isBefore, isToday } from 'date-fns'

import { ServiceType } from '@/generated/prisma/client'

interface DeliverableConfig {
  days: number
  label: string
}

export const DELIVERABLE_CONFIG: Record<ServiceType, DeliverableConfig> = {
  [ServiceType.COACHING_COMPLETE]: {
    days: 5,
    label: 'Deliver Training & Nutrition Plans',
  },
  [ServiceType.WORKOUT_PLAN]: {
    days: 3,
    label: 'Deliver Workout Plan',
  },
  [ServiceType.MEAL_PLAN]: {
    days: 3,
    label: 'Deliver Meal Plan',
  },
  [ServiceType.IN_PERSON_MEETING]: {
    days: 7,
    label: 'Schedule & Conduct Session',
  },
  [ServiceType.PREMIUM_ACCESS]: {
    days: 0,
    label: 'Premium Access Active',
  },
}

export function getDeliverableConfig(
  serviceType: ServiceType,
): DeliverableConfig {
  return (
    DELIVERABLE_CONFIG[serviceType] || { days: 7, label: 'Complete Delivery' }
  )
}

export function calculateDueDate(
  createdAt: Date | string,
  serviceType: ServiceType,
): Date {
  const config = getDeliverableConfig(serviceType)
  const created =
    typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  return addDays(created, config.days)
}

export function getDaysUntilDue(
  createdAt: Date | string,
  serviceType: ServiceType,
): number {
  const dueDate = calculateDueDate(createdAt, serviceType)
  return differenceInDays(dueDate, new Date())
}

export function isOverdue(
  createdAt: Date | string,
  serviceType: ServiceType,
  status: string,
): boolean {
  if (status === 'COMPLETED' || status === 'CANCELLED') return false
  const dueDate = calculateDueDate(createdAt, serviceType)
  return isBefore(dueDate, new Date()) && !isToday(dueDate)
}

export function isDueToday(
  createdAt: Date | string,
  serviceType: ServiceType,
): boolean {
  const dueDate = calculateDueDate(createdAt, serviceType)
  return isToday(dueDate)
}

export function isDueSoon(
  createdAt: Date | string,
  serviceType: ServiceType,
): boolean {
  const daysUntil = getDaysUntilDue(createdAt, serviceType)
  return daysUntil >= 0 && daysUntil <= 2
}

export type DeliveryUrgency =
  | 'overdue'
  | 'due-today'
  | 'due-soon'
  | 'upcoming'
  | 'completed'

export function getDeliveryUrgency(
  createdAt: Date | string,
  serviceType: ServiceType,
  status: string,
): DeliveryUrgency {
  if (status === 'COMPLETED') return 'completed'
  if (isOverdue(createdAt, serviceType, status)) return 'overdue'
  if (isDueToday(createdAt, serviceType)) return 'due-today'
  if (isDueSoon(createdAt, serviceType)) return 'due-soon'
  return 'upcoming'
}

export function getDeliverableLabel(serviceType: ServiceType): string {
  return getDeliverableConfig(serviceType).label
}
