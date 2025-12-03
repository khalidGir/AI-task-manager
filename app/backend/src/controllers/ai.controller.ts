import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';

export const AiController = {
  prioritize: async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const prioritizedTasks = await AiService.prioritizeTasksForUser(userId);
      res.status(200).json(prioritizedTasks);
    } catch (error) {
      console.error('AI prioritization error:', error);
      res.status(500).json({ message: 'Error prioritizing tasks' });
    }
  },
};