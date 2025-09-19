/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GQLTaskStatus, GQLTaskType } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import {
  completeMealPlanTasks,
  findPendingMealPlanTasks,
  findTrainerPendingMealPlanTasks,
  hasServiceDeliveryPendingMealPlanTasks,
} from '@/lib/service-task-completion'

// Mock the dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    serviceTask: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/server/models/service-task/factory', () => ({
  updateServiceTask: vi.fn(),
}))

const mockPrisma = prisma as any
const mockContext = {
  user: {
    user: { id: 'trainer-123' },
  },
} as any

describe('Service Task Completion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('findPendingMealPlanTasks', () => {
    it('should find pending meal plan delivery tasks', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Deliver Meal Plan',
          serviceDeliveryId: 'delivery-1',
          templateId: 'deliver_meal_plan',
          taskType: GQLTaskType.PlanDelivery,
          status: GQLTaskStatus.Pending,
          serviceDelivery: {
            id: 'delivery-1',
            serviceType: 'MEAL_PLAN',
            packageName: 'Custom Meal Plan',
          },
        },
      ]

      mockPrisma.serviceTask.findMany.mockResolvedValue(mockTasks)

      const result = await findPendingMealPlanTasks('trainer-123', 'client-456')

      expect(result).toEqual([
        {
          taskId: 'task-1',
          title: 'Deliver Meal Plan',
          serviceDeliveryId: 'delivery-1',
          templateId: 'deliver_meal_plan',
        },
      ])

      expect(mockPrisma.serviceTask.findMany).toHaveBeenCalledWith({
        where: {
          taskType: GQLTaskType.PlanDelivery,
          status: GQLTaskStatus.Pending,
          serviceDelivery: {
            trainerId: 'trainer-123',
            clientId: 'client-456',
            serviceType: 'MEAL_PLAN',
            status: {
              in: ['PENDING', 'IN_PROGRESS'],
            },
          },
        },
        include: {
          serviceDelivery: {
            select: {
              id: true,
              serviceType: true,
              packageName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })
    })

    it('should return empty array when no tasks found', async () => {
      mockPrisma.serviceTask.findMany.mockResolvedValue([])

      const result = await findPendingMealPlanTasks('trainer-123', 'client-456')

      expect(result).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.serviceTask.findMany.mockRejectedValue(new Error('DB Error'))

      const result = await findPendingMealPlanTasks('trainer-123', 'client-456')

      expect(result).toEqual([])
    })
  })

  describe('completeMealPlanTasks', () => {
    it('should complete pending meal plan tasks successfully', async () => {
      // Mock findPendingMealPlanTasks
      mockPrisma.serviceTask.findMany.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Deliver Meal Plan',
          serviceDeliveryId: 'delivery-1',
          templateId: 'deliver_meal_plan',
          taskType: GQLTaskType.PlanDelivery,
          status: GQLTaskStatus.Pending,
          serviceDelivery: {
            id: 'delivery-1',
            serviceType: 'MEAL_PLAN',
            packageName: 'Custom Meal Plan',
          },
        },
      ])

      // Mock task status check
      mockPrisma.serviceTask.findUnique.mockResolvedValue({
        status: GQLTaskStatus.Pending,
      })

      // Mock updateServiceTask
      const { updateServiceTask } = await import(
        '@/server/models/service-task/factory'
      )
      ;(updateServiceTask as any).mockResolvedValue({})

      const result = await completeMealPlanTasks(
        'trainer-123',
        'client-456',
        'nutrition-plan-789',
        mockContext,
      )

      expect(result.completedTasks).toHaveLength(1)
      expect(result.completedTasks[0]).toEqual({
        taskId: 'task-1',
        title: 'Deliver Meal Plan',
        serviceDeliveryId: 'delivery-1',
      })
      expect(result.errors).toHaveLength(0)
      expect(result.alreadyCompleted).toHaveLength(0)
    })

    it('should handle already completed tasks', async () => {
      // Mock findPendingMealPlanTasks
      mockPrisma.serviceTask.findMany.mockResolvedValue([
        {
          id: 'task-1',
          title: 'Deliver Meal Plan',
          serviceDeliveryId: 'delivery-1',
          templateId: 'deliver_meal_plan',
          taskType: GQLTaskType.PlanDelivery,
          status: GQLTaskStatus.Pending,
          serviceDelivery: {
            id: 'delivery-1',
            serviceType: 'MEAL_PLAN',
            packageName: 'Custom Meal Plan',
          },
        },
      ])

      // Mock task already completed
      mockPrisma.serviceTask.findUnique.mockResolvedValue({
        status: GQLTaskStatus.Completed,
      })

      const result = await completeMealPlanTasks(
        'trainer-123',
        'client-456',
        'nutrition-plan-789',
        mockContext,
      )

      expect(result.completedTasks).toHaveLength(0)
      expect(result.alreadyCompleted).toHaveLength(1)
      expect(result.alreadyCompleted[0]).toEqual({
        taskId: 'task-1',
        title: 'Deliver Meal Plan',
        serviceDeliveryId: 'delivery-1',
      })
      expect(result.errors).toHaveLength(0)
    })

    it('should handle no pending tasks', async () => {
      // Mock no pending tasks
      mockPrisma.serviceTask.findMany.mockResolvedValue([])

      const result = await completeMealPlanTasks(
        'trainer-123',
        'client-456',
        'nutrition-plan-789',
        mockContext,
      )

      expect(result.completedTasks).toHaveLength(0)
      expect(result.alreadyCompleted).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('findTrainerPendingMealPlanTasks', () => {
    it('should find all pending meal plan tasks for a trainer', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Deliver Meal Plan',
          serviceDeliveryId: 'delivery-1',
          createdAt: new Date('2023-01-01'),
          serviceDelivery: {
            id: 'delivery-1',
            clientId: 'client-456',
            packageName: 'Custom Meal Plan',
            client: {
              name: 'John Doe',
              profile: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
          },
        },
      ]

      mockPrisma.serviceTask.findMany.mockResolvedValue(mockTasks)

      const result = await findTrainerPendingMealPlanTasks('trainer-123')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        taskId: 'task-1',
        title: 'Deliver Meal Plan',
        serviceDeliveryId: 'delivery-1',
        clientId: 'client-456',
        clientName: 'John Doe',
        packageName: 'Custom Meal Plan',
        createdAt: new Date('2023-01-01'),
      })
    })

    it('should handle client name from profile', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Deliver Meal Plan',
          serviceDeliveryId: 'delivery-1',
          createdAt: new Date('2023-01-01'),
          serviceDelivery: {
            id: 'delivery-1',
            clientId: 'client-456',
            packageName: 'Custom Meal Plan',
            client: {
              name: null,
              profile: {
                firstName: 'Jane',
                lastName: 'Smith',
              },
            },
          },
        },
      ]

      mockPrisma.serviceTask.findMany.mockResolvedValue(mockTasks)

      const result = await findTrainerPendingMealPlanTasks('trainer-123')

      expect(result[0].clientName).toBe('Jane Smith')
    })
  })

  describe('hasServiceDeliveryPendingMealPlanTasks', () => {
    it('should return true when pending tasks exist', async () => {
      mockPrisma.serviceTask.count.mockResolvedValue(2)

      const result = await hasServiceDeliveryPendingMealPlanTasks('delivery-1')

      expect(result).toBe(true)
      expect(mockPrisma.serviceTask.count).toHaveBeenCalledWith({
        where: {
          serviceDeliveryId: 'delivery-1',
          taskType: GQLTaskType.PlanDelivery,
          status: GQLTaskStatus.Pending,
          templateId: 'deliver_meal_plan',
        },
      })
    })

    it('should return false when no pending tasks exist', async () => {
      mockPrisma.serviceTask.count.mockResolvedValue(0)

      const result = await hasServiceDeliveryPendingMealPlanTasks('delivery-1')

      expect(result).toBe(false)
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.serviceTask.count.mockRejectedValue(new Error('DB Error'))

      const result = await hasServiceDeliveryPendingMealPlanTasks('delivery-1')

      expect(result).toBe(false)
    })
  })
})
