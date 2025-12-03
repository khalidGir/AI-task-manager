import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import analyticsRouter from '../routes/analytics.routes';

// Setup the Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/analytics', analyticsRouter);

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

describe('Analytics API - /api/v1/analytics', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `analytics-test-${Date.now()}@example.com`,
        password: 'hashed_password',
      },
    });
    testUserId = user.id;

    // Create some test tasks to generate analytics
    await Promise.all([
      prisma.task.create({
        data: {
          title: 'Completed Task',
          userId: testUserId,
          status: 'done',
          completedAt: new Date(),
          createdAt: new Date(Date.now() - 86400000), // Yesterday
        },
      }),
      prisma.task.create({
        data: {
          title: 'Pending Task',
          userId: testUserId,
          status: 'pending',
        },
      }),
      prisma.task.create({
        data: {
          title: 'Overdue Task',
          userId: testUserId,
          status: 'pending',
          dueDate: new Date(Date.now() - 86400000), // Yesterday
        },
      }),
    ]);
  });

  describe('GET /overview', () => {
    it('should return analytics overview for the user', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalTasks');
      expect(response.body).toHaveProperty('completedTasks');
      expect(response.body).toHaveProperty('pendingTasks');
      expect(response.body).toHaveProperty('overdueTasks');
      expect(response.body).toHaveProperty('completedVsPendingRatio');
      expect(response.body).toHaveProperty('completionRatePercentage');
      expect(response.body).toHaveProperty('weeklyActivity');
      expect(response.body).toHaveProperty('monthlySummary');
      expect(response.body).toHaveProperty('productivityInsights');
      expect(response.body).toHaveProperty('aiRecommendations');
      
      // Verify that values make sense
      expect(response.body.totalTasks).toBeGreaterThanOrEqual(3);
      expect(response.body.completedTasks).toBeGreaterThanOrEqual(1);
      expect(response.body.pendingTasks).toBeGreaterThanOrEqual(2);
      expect(response.body.aiRecommendations).toBeInstanceOf(Array);
    });
  });
});