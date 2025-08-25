import { ServiceType } from '@/generated/prisma/client'

export enum TaskType {
  CONSULTATION = 'CONSULTATION',
  ASSESSMENT = 'ASSESSMENT',
  PLAN_CREATION = 'PLAN_CREATION',
  PLAN_DELIVERY = 'PLAN_DELIVERY',
  CHECK_IN = 'CHECK_IN',
  MEETING = 'MEETING',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

interface TaskTemplate {
  id: string
  title: string
  taskType: TaskType
  order: number
  isRequired: boolean
  requiresScheduling?: boolean
  estimatedDuration?: number
  isRecurring?: boolean
  intervalDays?: number
  recurrenceCount?: number
}

export const TASK_TEMPLATES: Record<ServiceType, TaskTemplate[]> = {
  [ServiceType.WORKOUT_PLAN]: [
    {
      id: 'create_plan',
      title: 'Create Training Plan',
      taskType: TaskType.PLAN_CREATION,
      order: 1,
      isRequired: true,
    },
    {
      id: 'deliver_plan',
      title: 'Deliver Plan',
      taskType: TaskType.PLAN_DELIVERY,
      order: 2,
      isRequired: true,
      requiresScheduling: false,
    },
    {
      id: 'checkin',
      title: 'Bi-weekly Check-in',
      taskType: TaskType.CHECK_IN,
      order: 5,
      isRequired: true,
      isRecurring: true,
      intervalDays: 14,
      recurrenceCount: 2,
    },
  ],
  [ServiceType.MEAL_PLAN]: [
    {
      id: 'create_meal_plan',
      title: 'Create Meal Plan',
      taskType: TaskType.PLAN_CREATION,
      order: 1,
      isRequired: true,
    },
    {
      id: 'deliver_meal_plan',
      title: 'Deliver Meal Plan',
      taskType: TaskType.PLAN_DELIVERY,
      order: 2,
      isRequired: true,
      requiresScheduling: false,
    },
  ],
  [ServiceType.IN_PERSON_MEETING]: [
    {
      id: 'consultation',
      title: 'Consultation',
      taskType: TaskType.CONSULTATION,
      order: 1,
      isRequired: false,
      requiresScheduling: true,
    },
    {
      id: 'schedule_meeting',
      title: 'Schedule Meeting',
      taskType: TaskType.MEETING,
      order: 2,
      isRequired: true,
      requiresScheduling: true,
    },
    {
      id: 'conduct_session',
      title: 'Conduct Session',
      taskType: TaskType.MEETING,
      order: 3,
      isRequired: true,
      estimatedDuration: 60,
    },
  ],
  [ServiceType.COACHING_COMPLETE]: [
    {
      id: 'create_training_plan',
      title: 'Create Training Plan',
      taskType: TaskType.PLAN_CREATION,
      order: 1,
      isRequired: true,
    },
    {
      id: 'create_nutrition_plan',
      title: 'Create Nutrition Plan',
      taskType: TaskType.PLAN_CREATION,
      order: 2,
      isRequired: true,
    },
    {
      id: 'deliver_plans',
      title: 'Deliver Plans',
      taskType: TaskType.PLAN_DELIVERY,
      order: 3,
      isRequired: true,
      requiresScheduling: false,
    },
    {
      id: 'bi_weekly_checkin',
      title: 'Bi-weekly Check-in',
      taskType: TaskType.CHECK_IN,
      order: 4,
      isRequired: true,
      isRecurring: true,
      intervalDays: 14,
      recurrenceCount: 2,
    },
  ],
  [ServiceType.PREMIUM_ACCESS]: [],
}

export function generateTasks(
  serviceDeliveryId: string,
  serviceType: ServiceType,
  quantity: number = 1,
) {
  const templates = TASK_TEMPLATES[serviceType] || []
  const tasks = []

  for (let i = 0; i < quantity; i++) {
    const suffix = quantity > 1 ? ` #${i + 1}` : ''

    for (const template of templates) {
      tasks.push({
        serviceDeliveryId,
        templateId: template.id,
        title: template.title + suffix,
        taskType: template.taskType,
        status: TaskStatus.PENDING,
        order: template.order,
        isRequired: template.isRequired,
        requiresScheduling: template.requiresScheduling || false,
        estimatedDuration: template.estimatedDuration,
        isRecurring: template.isRecurring || false,
        intervalDays: template.intervalDays,
        recurrenceCount: template.recurrenceCount,
      })
    }
  }

  return tasks
}
