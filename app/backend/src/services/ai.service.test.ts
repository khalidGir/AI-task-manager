import { PrismaClient } from '@prisma/client';
import { AiService } from './ai.service';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    task: {
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock the EventService
jest.mock('./event.service', () => ({
  EventService: {
    createEvent: jest.fn(),
  },
}));

const prisma = new PrismaClient();
const { EventService } = jest.requireMock('./event.service');

describe('AiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('prioritizeTasksForUser', () => {
    it('should prioritize tasks for a user and log the event', async () => {
      const userId = 'user1';
      const mockTasks = [
        { id: '1', title: 'Task 1', userId, dueDate: new Date('2023-12-31'), priority: 5 },
        { id: '2', title: 'Task 2', userId, dueDate: null, priority: 3 },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);
      (prisma.task.update as jest.Mock)
        .mockResolvedValueOnce({ id: '1', title: 'Task 1', userId, dueDate: new Date('2023-12-31'), priority: 5, aiScore: 85 })
        .mockResolvedValueOnce({ id: '2', title: 'Task 2', userId, dueDate: null, priority: 3, aiScore: 45 });

      const result = await AiService.prioritizeTasksForUser(userId);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId, status: { not: 'done' } },
      });
      expect(prisma.task.update).toHaveBeenCalledTimes(2);
      expect(EventService.createEvent).toHaveBeenCalledWith(userId, 'ai.prioritized', { numTasks: 2 });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('aiScore');
    });

    it('should handle case when there are no tasks for user', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      const result = await AiService.prioritizeTasksForUser('user1');

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1', status: { not: 'done' } },
      });
      expect(prisma.task.update).not.toHaveBeenCalled();
      expect(EventService.createEvent).toHaveBeenCalledWith('user1', 'ai.prioritized', { 
        numTasks: 0, 
        message: 'No pending tasks to prioritize' 
      });
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(AiService.prioritizeTasksForUser('user1')).rejects.toThrow('Failed to prioritize tasks using AI');
    });
  });

  describe('getTaskAnalysis', () => {
    it('should return analysis for a single task', async () => {
      const mockTask = {
        id: '1',
        title: 'Test Task',
        userId: 'user1',
        dueDate: new Date('2023-12-31'),
        priority: 5,
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        aiScore: null
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      const result = await AiService.getTaskAnalysis('1');

      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toHaveProperty('taskId', '1');
      expect(result).toHaveProperty('originalScore');
      expect(result).toHaveProperty('aiAdjustment');
      expect(result).toHaveProperty('finalScore');
      expect(result).toHaveProperty('urgencyScore');
      expect(result).toHaveProperty('userPriorityScore');
    });

    it('should throw an error if task is not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AiService.getTaskAnalysis('1')).rejects.toThrow('Task not found');
    });
  });
});