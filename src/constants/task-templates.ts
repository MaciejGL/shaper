import { ServiceType } from '@/generated/prisma/client'

export enum TaskType {
  PLAN_DELIVERY = 'PLAN_DELIVERY',
  MEETING_CHECKIN = 'MEETING_CHECKIN',
  MEETING_IN_PERSON = 'MEETING_IN_PERSON',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type AutoCompleteAction =
  | 'training_plan_assigned'
  | 'nutrition_plan_shared'
  | 'meeting_checkin_completed'
  | 'meeting_in_person_completed'

interface TaskTemplate {
  id: string
  title: string
  taskType: TaskType
  order: number
  isRequired: boolean
  isInitialOnly: boolean
  isRecurring: boolean
  autoCompleteOn?: AutoCompleteAction
}

export const TASK_TEMPLATES: Record<ServiceType, TaskTemplate[]> = {
  [ServiceType.COACHING_COMPLETE]: [
    {
      id: 'training_plan',
      title: 'Deliver Training Plan',
      taskType: TaskType.PLAN_DELIVERY,
      order: 1,
      isRequired: true,
      isInitialOnly: true,
      isRecurring: false,
      autoCompleteOn: 'training_plan_assigned',
    },
    {
      id: 'nutrition_plan',
      title: 'Deliver Nutrition Plan',
      taskType: TaskType.PLAN_DELIVERY,
      order: 2,
      isRequired: true,
      isInitialOnly: true,
      isRecurring: false,
      autoCompleteOn: 'nutrition_plan_shared',
    },
    {
      id: 'checkin_1',
      title: 'Check-in Meeting (Week 1-2)',
      taskType: TaskType.MEETING_CHECKIN,
      order: 3,
      isRequired: true,
      isInitialOnly: false,
      isRecurring: true,
      autoCompleteOn: 'meeting_checkin_completed',
    },
    {
      id: 'checkin_2',
      title: 'Check-in Meeting (Week 3-4)',
      taskType: TaskType.MEETING_CHECKIN,
      order: 4,
      isRequired: true,
      isInitialOnly: false,
      isRecurring: true,
      autoCompleteOn: 'meeting_checkin_completed',
    },
    {
      id: 'in_person',
      title: 'In-Person Workout Session',
      taskType: TaskType.MEETING_IN_PERSON,
      order: 5,
      isRequired: true,
      isInitialOnly: false,
      isRecurring: true,
      autoCompleteOn: 'meeting_in_person_completed',
    },
  ],

  [ServiceType.WORKOUT_PLAN]: [
    {
      id: 'deliver_plan',
      title: 'Deliver Workout Plan',
      taskType: TaskType.PLAN_DELIVERY,
      order: 1,
      isRequired: true,
      isInitialOnly: true,
      isRecurring: false,
      autoCompleteOn: 'training_plan_assigned',
    },
  ],

  [ServiceType.MEAL_PLAN]: [
    {
      id: 'deliver_meal_plan',
      title: 'Deliver Meal Plan',
      taskType: TaskType.PLAN_DELIVERY,
      order: 1,
      isRequired: true,
      isInitialOnly: true,
      isRecurring: false,
      autoCompleteOn: 'nutrition_plan_shared',
    },
  ],

  [ServiceType.IN_PERSON_MEETING]: [
    {
      id: 'conduct_session',
      title: 'Conduct In-Person Session',
      taskType: TaskType.MEETING_IN_PERSON,
      order: 1,
      isRequired: true,
      isInitialOnly: true,
      isRecurring: false,
      autoCompleteOn: 'meeting_in_person_completed',
    },
  ],

  [ServiceType.PREMIUM_ACCESS]: [],
}

interface GenerateTasksOptions {
  serviceDeliveryId: string
  serviceType: ServiceType
  isRecurringPayment: boolean
}

export function generateTasks({
  serviceDeliveryId,
  serviceType,
  isRecurringPayment,
}: GenerateTasksOptions) {
  const templates = TASK_TEMPLATES[serviceType] || []
  const tasks = []

  for (const template of templates) {
    // For recurring payments, only create recurring tasks
    if (isRecurringPayment && !template.isRecurring) {
      continue
    }

    // For initial payments, create all tasks
    tasks.push({
      serviceDeliveryId,
      templateId: template.id,
      title: template.title,
      taskType: template.taskType,
      status: TaskStatus.PENDING,
      order: template.order,
      isRequired: template.isRequired,
      autoCompleteOn: template.autoCompleteOn || null,
    })
  }

  return tasks
}

export function getTaskTemplateByAutoAction(
  serviceType: ServiceType,
  autoAction: AutoCompleteAction,
): TaskTemplate | undefined {
  const templates = TASK_TEMPLATES[serviceType] || []
  return templates.find((t) => t.autoCompleteOn === autoAction)
}
