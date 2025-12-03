import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

export const AuthController = {
  signUp: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await AuthService.signUp(email, password);

      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({
        id: user.id,
        email: user.email,
        accessToken
      });
    } catch (error: any) {
      console.error(error);
      // Check for unique constraint violation
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
          return res.status(409).json({ message: 'Email already in use' });
      }
      res.status(500).json({ message: 'Error creating user' });
    }
  },

  signIn: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await AuthService.signIn(email, password);

      const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({
        id: user.id,
        email: user.email,
        accessToken
      });
    } catch (error: any) {
      console.error(error);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  },
};