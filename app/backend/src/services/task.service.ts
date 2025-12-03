import { PrismaClient } from '@prisma/client';
import { EventService } from './event.service';
const prisma = new PrismaClient();

export const TaskService = {
  create: async (title: string, userId: string, description?: string, dueDate?: Date, priority?: number) => {
    const task = await prisma.task.create({
      data: { title, userId, description, dueDate, priority },
    });
    await EventService.createEvent(userId, 'task.created', { taskId: task.id, taskTitle: task.title }); // Log creation
    return task;
  },
  getAllForUser: (userId: string) => {
    return prisma.task.findMany({ where: { userId } });
  },
  update: async (id: string, data: { title?: string, description?: string, status?: string, priority?: number }) => {
    const task = await prisma.task.update({ where: { id }, data });
    await EventService.createEvent(task.userId, 'task.updated', { taskId: task.id, updatedFields: Object.keys(data) }); // Log update
    return task;
  },
  delete: async (id: string) => {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new Error('Task not found');
    }
    const deletedTask = await prisma.task.delete({ where: { id } });
    await EventService.createEvent(task.userId, 'task.deleted', { taskId: task.id, taskTitle: task.title }); // Log deletion
    return deletedTask;
  },
  // Mark task as completed
  markCompleted: async (id: string) => {
    const task = await prisma.task.update({
      where: { id },
      data: { status: 'done' }
    });
    await EventService.createEvent(task.userId, 'task.completed', { taskId: task.id, taskTitle: task.title }); // Log completion
    return task;
  },
  // Mark task as pending
  markPending: async (id: string) => {
    const task = await prisma.task.update({
      where: { id },
      data: { status: 'pending' }
    });
    await EventService.createEvent(task.userId, 'task.reopened', { taskId: task.id, taskTitle: task.title }); // Log reopening
    return task;
  },
  // Helper to verify a user owns a task
  verifyUserOwnsTask: async (userId: string, taskId: string) => {
    const task = await prisma.task.findUnique({ where: { id: taskId }});
    return task?.userId === userId;
  }
};