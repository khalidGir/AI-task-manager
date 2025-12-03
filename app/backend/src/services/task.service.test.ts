import { PrismaClient } from '@prisma/client';
import { TaskService } from './task.service';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task and log the event', async () => {
      const mockTask = { id: '1', title: 'Test Task', userId: 'user1', status: 'pending' };
      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);
      (EventService.createEvent as jest.Mock).mockResolvedValue({});

      const result = await TaskService.create('Test Task', 'user1', 'Test description', new Date(), 5);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { 
          title: 'Test Task', 
          userId: 'user1', 
          description: 'Test description', 
          dueDate: expect.any(Date),
          priority: 5
        },
      });
      expect(EventService.createEvent).toHaveBeenCalledWith('user1', 'task.created', {
        taskId: '1',
        taskTitle: 'Test Task'
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('getAllForUser', () => {
    it('should return all tasks for a user', async () => {
      const mockTasks = [{ id: '1', title: 'Task 1' }, { id: '2', title: 'Task 2' }];
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await TaskService.getAllForUser('user1');

      expect(prisma.task.findMany).toHaveBeenCalledWith({ where: { userId: 'user1' } });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('update', () => {
    it('should update a task and log the event', async () => {
      const mockTask = { id: '1', title: 'Updated Task', userId: 'user1' };
      (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);
      (EventService.createEvent as jest.Mock).mockResolvedValue({});

      const result = await TaskService.update('1', { title: 'Updated Task' });

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'Updated Task' },
      });
      expect(EventService.createEvent).toHaveBeenCalledWith('user1', 'task.updated', {
        taskId: '1',
        updatedFields: ['title']
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('delete', () => {
    it('should delete a task and log the event', async () => {
      const mockTask = { id: '1', title: 'Test Task', userId: 'user1' };
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.delete as jest.Mock).mockResolvedValue(mockTask);
      (EventService.createEvent as jest.Mock).mockResolvedValue({});

      const result = await TaskService.delete('1');

      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(EventService.createEvent).toHaveBeenCalledWith('user1', 'task.deleted', {
        taskId: '1',
        taskTitle: 'Test Task'
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw an error if task is not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(TaskService.delete('1')).rejects.toThrow('Task not found');
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });
  });

  describe('markCompleted', () => {
    it('should mark a task as completed and log the event', async () => {
      const mockTask = { id: '1', title: 'Test Task', userId: 'user1', status: 'done' };
      (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);
      (EventService.createEvent as jest.Mock).mockResolvedValue({});

      const result = await TaskService.markCompleted('1');

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'done' },
      });
      expect(EventService.createEvent).toHaveBeenCalledWith('user1', 'task.completed', {
        taskId: '1',
        taskTitle: 'Test Task'
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('markPending', () => {
    it('should mark a task as pending and log the event', async () => {
      const mockTask = { id: '1', title: 'Test Task', userId: 'user1', status: 'pending' };
      (prisma.task.update as jest.Mock).mockResolvedValue(mockTask);
      (EventService.createEvent as jest.Mock).mockResolvedValue({});

      const result = await TaskService.markPending('1');

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'pending' },
      });
      expect(EventService.createEvent).toHaveBeenCalledWith('user1', 'task.reopened', {
        taskId: '1',
        taskTitle: 'Test Task'
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('verifyUserOwnsTask', () => {
    it('should return true if user owns the task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: '1', userId: 'user1' });

      const result = await TaskService.verifyUserOwnsTask('user1', '1');

      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe(true);
    });

    it('should return false if user does not own the task', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({ id: '1', userId: 'user2' });

      const result = await TaskService.verifyUserOwnsTask('user1', '1');

      expect(result).toBe(false);
    });

    it('should return false if task does not exist', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await TaskService.verifyUserOwnsTask('user1', '1');

      expect(result).toBe(false);
    });
  });
});