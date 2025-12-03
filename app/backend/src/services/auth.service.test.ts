// Mock the dependencies before importing the AuthService
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('./event.service', () => ({
  EventService: {
    createEvent: jest.fn(),
  },
}));

import { AuthService } from './auth.service';

// Import the actual modules to access their mocked functions
const bcrypt = jest.requireMock('bcrypt');
const { PrismaClient } = jest.requireMock('@prisma/client');
const mockPrisma = new PrismaClient();

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should hash the password and create a new user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const createdUser = { id: '1', email, password: hashedPassword };

      // Configure our mocks to return expected values for this test
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      // Call the method we are testing
      const result = await AuthService.signUp(email, password);

      // Assert that the functions were called correctly
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Assert that the result is what we expect
      expect(result).toEqual(createdUser);
    });
  });
});