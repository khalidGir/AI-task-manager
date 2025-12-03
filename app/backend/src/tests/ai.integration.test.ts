import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import aiRouter from '../routes/ai.routes';

// Setup the Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/ai', aiRouter);

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
  // Delete related records in order to respect foreign key constraints
  await prisma.task.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  // Delete related records in reverse order to respect foreign key constraints
  await prisma.task.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('AI API - /api/v1/ai', () => {
  let testUserId: string;
  let testTaskIds: string[] = [];

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `ai-test-${Date.now()}@example.com`,
        password: 'hashed_password',
      },
    });
    testUserId = user.id;

    // Create some test tasks for AI prioritization
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          title: 'Urgent Task',
          userId: testUserId,
          dueDate: new Date(Date.now() + 86400000), // Tomorrow
          status: 'pending'
        },
      }),
      prisma.task.create({
        data: {
          title: 'Less Urgent Task',
          userId: testUserId,
          dueDate: new Date(Date.now() + 86400000 * 7), // In a week
          status: 'pending'
        },
      }),
    ]);
    
    testTaskIds = tasks.map(task => task.id);
  });

  describe('POST /prioritize', () => {
    it('should prioritize tasks for a user', async () => {
      const response = await request(app)
        .post('/api/v1/ai/prioritize');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2); // Two pending tasks
      
      // Check that tasks have aiScore property
      expect(response.body[0]).toHaveProperty('aiScore');
      expect(response.body[1]).toHaveProperty('aiScore');
      
      // Check that tasks are sorted by score (highest first)
      if (response.body.length > 1) {
        expect(response.body[0].aiScore).toBeGreaterThanOrEqual(response.body[1].aiScore);
      }
    });
  });
});