import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export const AnalyticsController = {
  getOverview: async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const overview = await AnalyticsService.getOverview(userId);
      res.status(200).json(overview);
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      res.status(500).json({ message: 'Error fetching analytics overview' });
    }
  },
};