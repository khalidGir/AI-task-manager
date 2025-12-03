import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export const TaskController = {
  create: async (req: Request, res: Response) => {
    try {
      const { title, description, dueDate, priority } = req.body;
      const userId = req.userId!; // We know userId is present from authMiddleware
      const task = await TaskService.create(title, userId, description, dueDate, priority);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error creating task' });
    }
  },
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const tasks = await TaskService.getAllForUser(userId);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tasks' });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      if (!await TaskService.verifyUserOwnsTask(userId, id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const task = await TaskService.update(id, req.body);
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error updating task' });
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      if (!await TaskService.verifyUserOwnsTask(userId, id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await TaskService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting task' });
    }
  },
  markCompleted: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      if (!await TaskService.verifyUserOwnsTask(userId, id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const task = await TaskService.markCompleted(id);
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error marking task as completed' });
    }
  },
  markPending: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;

      if (!await TaskService.verifyUserOwnsTask(userId, id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const task = await TaskService.markPending(id);
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error marking task as pending' });
    }
  }
};