import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { EventService } from './event.service';

const prisma = new PrismaClient();

export const AuthService = {
  signUp: async (email: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    await EventService.createEvent(user.id, 'user.signedUp', { userEmail: user.email }); // Log signup
    return user;
  },

  signIn: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    await EventService.createEvent(user.id, 'user.signedIn', { userEmail: user.email }); // Log signin
    return user;
  },

  // Helper to verify password (useful for change password functionality)
  verifyPassword: async (inputPassword: string, hashedPassword: string) => {
    return await bcrypt.compare(inputPassword, hashedPassword);
  },

  // Helper to hash password (useful for change password functionality)
  hashPassword: async (password: string) => {
    return await bcrypt.hash(password, 10);
  },
};