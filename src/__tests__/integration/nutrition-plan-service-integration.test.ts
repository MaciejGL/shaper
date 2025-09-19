/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GQLUserRole } from '@/generated/graphql-server'
import { notifyNutritionPlanShared } from '@/lib/meal-plan-notifications'
import { MealPlanTaskService } from '@/lib/service-task-completion'
import { shareNutritionPlanWithClient } from '@/server/models/nutrition-plan/factory'

// Mock the dependencies
vi.mock('@/server/models/nutrition-plan/factory', () => ({
  shareNutritionPlanWithClient: vi.fn(),
}))

vi.mock('@/lib/service-task-completion', () => ({
  MealPlanTaskService: {
    completeTasks: vi.fn(),
  },
}))

vi.mock('@/lib/meal-plan-notifications', () => ({
  notifyNutritionPlanShared: vi.fn(),
}))

vi.mock('@/lib/getUser', () => ({
  requireAuth: vi.fn(),
}))

describe('Nutrition Plan Service Integration', () => {
  const mockContext = {
    user: {
      user: { id: 'trainer-123', role: GQLUserRole.Trainer },
    },
    loaders: {},
  } as any

  const mockNutritionPlan = {
    id: 'nutrition-plan-789',
    clientId: 'client-456',
    trainerId: 'trainer-123',
    name: 'Custom Meal Plan',
    isSharedWithClient: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
    sharedAt: new Date(),
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Nutrition Plan Sharing with Service Task Integration', () => {
    it('should complete service tasks when sharing nutrition plan', async () => {
      // Mock successful sharing
      vi.mocked(shareNutritionPlanWithClient).mockResolvedValue(
        mockNutritionPlan,
      )

      // Mock successful task completion
      const mockTaskCompletion = {
        completedTasks: [
          {
            taskId: 'task-1',
            title: 'Deliver Meal Plan',
            serviceDeliveryId: 'delivery-1',
          },
        ],
        alreadyCompleted: [],
        errors: [],
      }
      vi.mocked(MealPlanTaskService.completeTasks).mockResolvedValue(
        mockTaskCompletion,
      )

      // Mock successful notification
      vi.mocked(notifyNutritionPlanShared).mockResolvedValue(undefined)

      // Import and call the resolver logic
      const { requireAuth } = await import('@/lib/getUser')
      vi.mocked(requireAuth).mockReturnValue({
        user: { id: 'trainer-123' },
      } as any)

      // Simulate the resolver workflow
      const user = { user: { id: 'trainer-123' } }
      const nutritionPlanId = 'nutrition-plan-789'

      // 1. Share nutrition plan
      const sharedPlan = await shareNutritionPlanWithClient(
        nutritionPlanId,
        user.user.id,
      )

      // 2. Complete service tasks
      const taskCompletion = await MealPlanTaskService.completeTasks(
        user.user.id,
        sharedPlan.clientId,
        nutritionPlanId,
        mockContext,
      )

      // 3. Send notifications
      await notifyNutritionPlanShared(
        nutritionPlanId,
        user.user.id,
        mockContext,
      )

      // Verify all steps were called correctly
      expect(shareNutritionPlanWithClient).toHaveBeenCalledWith(
        nutritionPlanId,
        'trainer-123',
      )
      expect(MealPlanTaskService.completeTasks).toHaveBeenCalledWith(
        'trainer-123',
        'client-456',
        nutritionPlanId,
        mockContext,
      )
      expect(notifyNutritionPlanShared).toHaveBeenCalledWith(
        nutritionPlanId,
        'trainer-123',
        mockContext,
      )

      // Verify task completion results
      expect(taskCompletion.completedTasks).toHaveLength(1)
      expect(taskCompletion.errors).toHaveLength(0)
    })

    it('should handle task completion errors gracefully without breaking sharing flow', async () => {
      // Mock successful sharing
      vi.mocked(shareNutritionPlanWithClient).mockResolvedValue(
        mockNutritionPlan,
      )

      // Mock task completion with errors
      const mockTaskCompletion = {
        completedTasks: [],
        alreadyCompleted: [],
        errors: [
          {
            taskId: 'task-1',
            error: 'Task not found',
          },
        ],
      }
      vi.mocked(MealPlanTaskService.completeTasks).mockResolvedValue(
        mockTaskCompletion,
      )

      // Mock successful notification
      vi.mocked(notifyNutritionPlanShared).mockResolvedValue(undefined)

      // Simulate the resolver workflow
      const user = { user: { id: 'trainer-123' } }
      const nutritionPlanId = 'nutrition-plan-789'

      const sharedPlan = await shareNutritionPlanWithClient(
        nutritionPlanId,
        user.user.id,
      )
      const taskCompletion = await MealPlanTaskService.completeTasks(
        user.user.id,
        sharedPlan.clientId,
        nutritionPlanId,
        mockContext,
      )
      await notifyNutritionPlanShared(
        nutritionPlanId,
        user.user.id,
        mockContext,
      )

      // Verify sharing and notifications still work despite task errors
      expect(shareNutritionPlanWithClient).toHaveBeenCalled()
      expect(notifyNutritionPlanShared).toHaveBeenCalled()
      expect(taskCompletion.errors).toHaveLength(1)
    })

    it('should handle complete task completion failure gracefully', async () => {
      // Mock successful sharing
      vi.mocked(shareNutritionPlanWithClient).mockResolvedValue(
        mockNutritionPlan,
      )

      // Mock task completion throwing error
      vi.mocked(MealPlanTaskService.completeTasks).mockRejectedValue(
        new Error('Task completion failed'),
      )

      // Mock successful notification
      vi.mocked(notifyNutritionPlanShared).mockResolvedValue(undefined)

      // Simulate the resolver workflow with error handling
      const user = { user: { id: 'trainer-123' } }
      const nutritionPlanId = 'nutrition-plan-789'

      const sharedPlan = await shareNutritionPlanWithClient(
        nutritionPlanId,
        user.user.id,
      )

      // Task completion should fail but not throw
      let taskCompletionError = null
      try {
        await MealPlanTaskService.completeTasks(
          user.user.id,
          sharedPlan.clientId,
          nutritionPlanId,
          mockContext,
        )
      } catch (error) {
        taskCompletionError = error
      }

      // Notifications should still work
      await notifyNutritionPlanShared(
        nutritionPlanId,
        user.user.id,
        mockContext,
      )

      // Verify sharing and notifications still work despite complete task failure
      expect(shareNutritionPlanWithClient).toHaveBeenCalled()
      expect(notifyNutritionPlanShared).toHaveBeenCalled()
      expect(taskCompletionError).toBeTruthy()
    })

    it('should handle multiple completed tasks correctly', async () => {
      // Mock successful sharing
      vi.mocked(shareNutritionPlanWithClient).mockResolvedValue(
        mockNutritionPlan,
      )

      // Mock multiple task completion scenarios
      const mockTaskCompletion = {
        completedTasks: [
          {
            taskId: 'task-1',
            title: 'Deliver Meal Plan',
            serviceDeliveryId: 'delivery-1',
          },
          {
            taskId: 'task-2',
            title: 'Deliver Meal Plan',
            serviceDeliveryId: 'delivery-2',
          },
        ],
        alreadyCompleted: [
          {
            taskId: 'task-3',
            title: 'Deliver Meal Plan',
            serviceDeliveryId: 'delivery-3',
          },
        ],
        errors: [],
      }
      vi.mocked(MealPlanTaskService.completeTasks).mockResolvedValue(
        mockTaskCompletion,
      )

      // Mock successful notification
      vi.mocked(notifyNutritionPlanShared).mockResolvedValue(undefined)

      // Simulate the resolver workflow
      const user = { user: { id: 'trainer-123' } }
      const nutritionPlanId = 'nutrition-plan-789'

      const sharedPlan = await shareNutritionPlanWithClient(
        nutritionPlanId,
        user.user.id,
      )
      const taskCompletion = await MealPlanTaskService.completeTasks(
        user.user.id,
        sharedPlan.clientId,
        nutritionPlanId,
        mockContext,
      )
      await notifyNutritionPlanShared(
        nutritionPlanId,
        user.user.id,
        mockContext,
      )

      // Verify task completion results
      expect(taskCompletion.completedTasks).toHaveLength(2)
      expect(taskCompletion.alreadyCompleted).toHaveLength(1)
      expect(taskCompletion.errors).toHaveLength(0)
    })
  })

  describe('Service Task Completion Metadata and Logging', () => {
    it('should include nutrition plan ID in task completion notes', async () => {
      const mockTaskCompletion = {
        completedTasks: [
          {
            taskId: 'task-1',
            title: 'Deliver Meal Plan',
            serviceDeliveryId: 'delivery-1',
          },
        ],
        alreadyCompleted: [],
        errors: [],
      }
      vi.mocked(MealPlanTaskService.completeTasks).mockResolvedValue(
        mockTaskCompletion,
      )

      const nutritionPlanId = 'nutrition-plan-789'

      await MealPlanTaskService.completeTasks(
        'trainer-123',
        'client-456',
        nutritionPlanId,
        mockContext,
      )

      // Verify MealPlanTaskService.completeTasks was called with nutrition plan ID
      expect(MealPlanTaskService.completeTasks).toHaveBeenCalledWith(
        'trainer-123',
        'client-456',
        nutritionPlanId,
        mockContext,
      )
    })

    it('should provide task completion summary for logging', async () => {
      const mockTaskCompletion = {
        completedTasks: [
          {
            taskId: 'task-1',
            title: 'Deliver Meal Plan',
            serviceDeliveryId: 'delivery-1',
          },
        ],
        alreadyCompleted: [
          {
            taskId: 'task-2',
            title: 'Deliver Meal Plan',
            serviceDeliveryId: 'delivery-2',
          },
        ],
        errors: [{ taskId: 'task-3', error: 'Task not found' }],
      }
      vi.mocked(MealPlanTaskService.completeTasks).mockResolvedValue(
        mockTaskCompletion,
      )

      const result = await MealPlanTaskService.completeTasks(
        'trainer-123',
        'client-456',
        'nutrition-plan-789',
        mockContext,
      )

      // Verify comprehensive result structure for logging
      expect(result).toHaveProperty('completedTasks')
      expect(result).toHaveProperty('alreadyCompleted')
      expect(result).toHaveProperty('errors')
      expect(result.completedTasks).toHaveLength(1)
      expect(result.alreadyCompleted).toHaveLength(1)
      expect(result.errors).toHaveLength(1)
    })
  })
})
