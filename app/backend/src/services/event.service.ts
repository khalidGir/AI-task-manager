import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const EventService = {
  createEvent: async (userId: string, action: string, metadata?: object) => {
    return prisma.event.create({
      data: {
        userId,
        action,
        metadata: metadata ? JSON.stringify(metadata) : '{}',
      },
    });
  },

  getEventsForUser: async (userId: string, filter?: 'today' | 'week' | 'month' | 'all', limit?: number) => {
    let whereClause: any = { userId };
    const now = new Date();

    if (filter === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause = {
        ...whereClause,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    } else if (filter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      endOfWeek.setHours(23, 59, 59, 999);
      whereClause = {
        ...whereClause,
        timestamp: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      };
    } else if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      whereClause = {
        ...whereClause,
        timestamp: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }

    const queryOptions: any = {
      where: whereClause,
      orderBy: {
        timestamp: 'desc',
      },
    };

    if (limit) {
      queryOptions.take = limit;
    }

    return prisma.event.findMany(queryOptions);
  },

  // Get events by action type
  getEventsByAction: async (userId: string, action: string, limit?: number) => {
    const queryOptions: any = {
      where: {
        userId,
        action,
      },
      orderBy: {
        timestamp: 'desc',
      },
    };

    if (limit) {
      queryOptions.take = limit;
    }

    return prisma.event.findMany(queryOptions);
  },

  // Get events in a custom date range
  getEventsByDateRange: async (userId: string, startDate: Date, endDate: Date) => {
    return prisma.event.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  },

  // Count events for user
  countEventsForUser: async (userId: string, filter?: 'today' | 'week' | 'month') => {
    let whereClause: any = { userId };
    const now = new Date();

    if (filter === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause = {
        ...whereClause,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    } else if (filter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      endOfWeek.setHours(23, 59, 59, 999);
      whereClause = {
        ...whereClause,
        timestamp: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      };
    } else if (filter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      whereClause = {
        ...whereClause,
        timestamp: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }

    return prisma.event.count({ where: whereClause });
  }
};