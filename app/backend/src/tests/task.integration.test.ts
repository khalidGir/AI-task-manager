import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import taskRouter from '../routes/task.routes';
import jwt from 'jsonwebtoken';

// Setup the Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/tasks', taskRouter);

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

describe('Task API - /api/v1/tasks', () => {
  // Create a test user first
  let testUserId: string;
  let testTaskId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'hashed_password',
      },
    });
    testUserId = user.id;
  });

  describe('POST /', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date('2023-12-31'),
        priority: 5,
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Task');
      expect(response.body).toHaveProperty('description', 'Test Description');
      expect(response.body).toHaveProperty('priority', 5);
      
      testTaskId = response.body.id;
    });
  });

  describe('GET /', () => {
    it('should return all tasks for the user', async () => {
      const response = await request(app)
        .get('/api/v1/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title', 'Test Task');
    });
  });

  describe('PATCH /:id', () => {
    it('should update a task', async () => {
      const updateData = {
        title: 'Updated Task Title',
        description: 'Updated Description',
      };

      const response = await request(app)
        .patch(`/api/v1/tasks/${testTaskId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Task Title');
      expect(response.body).toHaveProperty('description', 'Updated Description');
    });
  });

  describe('PATCH /:id/complete', () => {
    it('should mark a task as completed', async () => {
      const response = await request(app)
        .patch(`/api/v1/tasks/${testTaskId}/complete`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'done');
      expect(response.body).toHaveProperty('completedAt');
    });
  });

  describe('PATCH /:id/pending', () => {
    it('should mark a task as pending', async () => {
      const response = await request(app)
        .patch(`/api/v1/tasks/${testTaskId}/pending`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('completedAt', null);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a task', async () => {
      // First create another task to delete
      const newTask = {
        title: 'Task to Delete',
        description: 'Task for deletion test',
      };

      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send(newTask);

      const taskIdToDelete = createResponse.body.id;
      
      const response = await request(app)
        .delete(`/api/v1/tasks/${taskIdToDelete}`);

      expect(response.status).toBe(204);
    });
  });
});