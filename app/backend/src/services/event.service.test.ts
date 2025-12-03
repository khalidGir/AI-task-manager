import { PrismaClient } from '@prisma/client';
import { EventService } from './event.service';

// Mock the PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create a new event with metadata', async () => {
      const mockEvent = { id: '1', userId: 'user1', action: 'test.action', metadata: '{"key": "value"}' };
      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await EventService.createEvent('user1', 'test.action', { key: 'value' });

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          action: 'test.action',
          metadata: JSON.stringify({ key: 'value' }),
        },
      });
      expect(result).toEqual(mockEvent);
    });

    it('should create a new event with empty metadata when not provided', async () => {
      const mockEvent = { id: '1', userId: 'user1', action: 'test.action', metadata: '{}' };
      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await EventService.createEvent('user1', 'test.action');

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          action: 'test.action',
          metadata: '{}',
        },
      });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('getEventsForUser', () => {
    it('should get all events for a user without filter', async () => {
      const mockEvents = [{ id: '1', userId: 'user1', action: 'test.action' }];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await EventService.getEventsForUser('user1');

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toEqual(mockEvents);
    });

    it('should get events for today', async () => {
      const mockEvents = [{ id: '1', userId: 'user1', action: 'test.action' }];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await EventService.getEventsForUser('user1', 'today');

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 'user1',
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should get events for week', async () => {
      const mockEvents = [{ id: '1', userId: 'user1', action: 'test.action' }];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await EventService.getEventsForUser('user1', 'week');

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 'user1',
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should get events for month', async () => {
      const mockEvents = [{ id: '1', userId: 'user1', action: 'test.action' }];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await EventService.getEventsForUser('user1', 'month');

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 'user1',
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should get events with limit', async () => {
      const mockEvents = [{ id: '1', userId: 'user1', action: 'test.action' }];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await EventService.getEventsForUser('user1', 'all', 10);

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventsByAction', () => {
    it('should get events by action type', async () => {
      const mockEvents = [{ id: '1', userId: 'user1', action: 'task.created' }];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await EventService.getEventsByAction('user1', 'task.created');

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          action: 'task.created',
        },
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toEqual(mockEvents);
    });

    it('should get events by action type with limit', async () => {
      const mockEvents = [{ id: '1', userId: 'user1', action: 'task.created' }];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await EventService.getEventsByAction('user1', 'task.created', 5);

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          action: 'task.created',
        },
        orderBy: { timestamp: 'desc' },
        take: 5,
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventsByDateRange', () => {
    it('should get events in a date range', async () => {
      const mockEvents = [{ id: '1', userId: 'user1', action: 'task.created' }];
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await EventService.getEventsByDateRange('user1', startDate, endDate);

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: 'desc' },
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('countEventsForUser', () => {
    it('should count all events for a user', async () => {
      (prisma.event.count as jest.Mock).mockResolvedValue(5);

      const result = await EventService.countEventsForUser('user1');

      expect(prisma.event.count).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
      expect(result).toBe(5);
    });

    it('should count events for today', async () => {
      (prisma.event.count as jest.Mock).mockResolvedValue(3);

      const result = await EventService.countEventsForUser('user1', 'today');

      expect(prisma.event.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 'user1',
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      });
      expect(result).toBe(3);
    });

    it('should count events for week', async () => {
      (prisma.event.count as jest.Mock).mockResolvedValue(10);

      const result = await EventService.countEventsForUser('user1', 'week');

      expect(prisma.event.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 'user1',
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      });
      expect(result).toBe(10);
    });

    it('should count events for month', async () => {
      (prisma.event.count as jest.Mock).mockResolvedValue(25);

      const result = await EventService.countEventsForUser('user1', 'month');

      expect(prisma.event.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: 'user1',
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      });
      expect(result).toBe(25);
    });
  });
});