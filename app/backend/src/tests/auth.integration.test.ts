import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from '../routes/auth.routes';

// Setup the Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);

const prisma = new PrismaClient();

// Clean up the database before and after tests
beforeAll(async () => {
  // Delete related records in order to respect foreign key constraints
  await prisma.task.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  // Delete related records in order to respect foreign key constraints
  await prisma.task.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('Auth API - /api/v1/auth', () => {
  describe('POST /signup', () => {
    it('should create a new user and return a token', async () => {
      const newUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(newUser);

      // Assert the response
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', newUser.email);
      expect(response.body).toHaveProperty('accessToken');

      // Assert that the user was actually created in the database
      const dbUser = await prisma.user.findUnique({ where: { email: newUser.email } });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.email).toBe(newUser.email);
    });

    it('should return a 409 error if the email is already in use', async () => {
      const existingUser = {
        email: `existing-${Date.now()}@example.com`,
        password: 'password123',
      };

      // First, create the user
      await request(app).post('/api/v1/auth/signup').send(existingUser);

      // Then, try to create it again
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(existingUser);

      // Assert the conflict error
      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email already in use');
    });
  });
});