import { Request, Response } from 'express';
import { EventService } from '../services/event.service';

export const EventController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const filter = req.query.filter as 'today' | 'week' | 'all' | undefined;
      const events = await EventService.getEventsForUser(userId, filter);
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Error fetching events' });
    }
  },
};