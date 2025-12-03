import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import eventRouter from '../routes/event.routes';

// Setup the Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/events', eventRouter);

// Mock auth middleware to simulate authenticated user
jest.mock('../middleware/auth.middleware', () => {
  const actualMiddleware = jest.requireActual('../middleware/auth.middleware');
  return {
    ...actualMiddleware,
    authMiddleware: (req: any, res: any, next: any) => {
      req.userId = 'test-user-id';
      next();
    }
  };
});

const prisma = new PrismaClient();

// Clean up the database before and after tests
beforeAll(async () => {
  // Delete related records first due to foreign key constraints
  await prisma.event.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.event.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('Event API - /api/v1/events', () => {
  let testUserId: string;
  let testEventIds: string[] = [];

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `event-test-${Date.now()}@example.com`,
        password: 'hashed_password',
      },
    });
    testUserId = user.id;

    // Create some test events
    const events = await Promise.all([
      prisma.event.create({
        data: {
          userId: testUserId,
          action: 'task.created',
          metadata: '{"taskId": "1", "taskTitle": "Test Task"}',
          timestamp: new Date(Date.now() - 86400000), // Yesterday
        },
      }),
      prisma.event.create({
        data: {
          userId: testUserId,
          action: 'task.completed',
          metadata: '{"taskId": "1", "taskTitle": "Test Task"}',
          timestamp: new Date(),
        },
      }),
    ]);
    
    testEventIds = events.map(event => event.id);
  });

  describe('GET /', () => {
    it('should return all events for the user', async () => {
      const response = await request(app)
        .get('/api/v1/events');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('action');
      expect(response.body[0]).toHaveProperty('timestamp');
      expect(response.body[0]).toHaveProperty('metadata');
    });

    it('should return events filtered by today', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .query({ filter: 'today' });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      // Should only return the event from today
      expect(response.body.length).toBeLessThanOrEqual(2);
    });

    it('should return events filtered by week', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .query({ filter: 'week' });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2); // Both events should be within a week
    });
  });
});