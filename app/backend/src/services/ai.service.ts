import { PrismaClient, Task } from '@prisma/client';
import { EventService } from './event.service';
const prisma = new PrismaClient();

// --- AI Model Abstraction (Placeholder) ---
// In a real scenario, this would be a sophisticated module that might call an external LLM.
// For now, it's a placeholder that returns a random adjustment.
const getAiAdjustment = async (task: Task): Promise<number> => {
  // Simulate AI analysis with a more intelligent algorithm
  // Consider task complexity, past performance, and other factors
  let adjustment = 0;

  // Add some intelligence based on task properties
  if (task.description && task.description.length > 100) {
    // Longer descriptions might indicate more complex tasks
    adjustment += 5;
  }

  if (task.dueDate) {
    const now = new Date();
    const diffDays = (task.dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

    // Tasks with tighter deadlines might need more attention
    if (diffDays < 1) {
      adjustment += 3;
    } else if (diffDays < 3) {
      adjustment += 1;
    }
  }

  // Add some randomness to make it feel like AI is learning
  const randomFactor = Math.floor(Math.random() * 7) - 3; // -3 to +3
  adjustment += randomFactor;

  return Promise.resolve(Math.max(-5, Math.min(15, adjustment))); // Range between -5 and 15
};

const calculateUrgency = (dueDate: Date | null): number => {
  if (!dueDate) return 0;
  const now = new Date();
  const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
  if (diffDays < 0) return 100; // Overdue tasks get max urgency
  if (diffDays < 2) return 80; // Due in next 2 days
  if (diffDays < 7) return 50; // Due in next week
  return 10; // Due later
};

export const AiService = {
  prioritizeTasksForUser: async (userId: string) => {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId, status: { not: 'done' } },
      });

      if (tasks.length === 0) {
        // Log event even if no tasks exist
        await EventService.createEvent(userId, 'ai.prioritized', { numTasks: 0, message: 'No pending tasks to prioritize' });
        return [];
      }

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          // 1. Calculate baseline score based on rules
          const urgencyScore = calculateUrgency(task.dueDate); // Weight = 50%
          const userPriorityScore = (task.priority || 5) * 10; // Weight = 30%
          let baselineScore = urgencyScore * 0.5 + userPriorityScore * 0.3;

          // 2. Get AI adjustment (Placeholder)
          const aiAdjustment = await getAiAdjustment(task); // Weight = 20%
          let finalScore = Math.round(baselineScore + aiAdjustment * 0.2); // AI weight factor

          // 3. Clamp score between 0 and 100
          finalScore = Math.max(0, Math.min(100, finalScore));

          // 4. Update the task in the database
          return prisma.task.update({
            where: { id: task.id },
            data: { aiScore: finalScore },
          });
        })
      );

      await EventService.createEvent(userId, 'ai.prioritized', { numTasks: updatedTasks.length }); // Log AI prioritization

      // Return the updated tasks sorted by the new score
      return updatedTasks.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    } catch (error) {
      console.error('Error in AI prioritization:', error);
      throw new Error('Failed to prioritize tasks using AI');
    }
  },

  // Method to get AI analysis for a single task
  getTaskAnalysis: async (taskId: string) => {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new Error('Task not found');
    }

    const aiAdjustment = await getAiAdjustment(task);
    const urgencyScore = calculateUrgency(task.dueDate);
    const userPriorityScore = (task.priority || 5) * 10;
    const baselineScore = urgencyScore * 0.5 + userPriorityScore * 0.3;
    const finalScore = Math.max(0, Math.min(100, Math.round(baselineScore + aiAdjustment * 0.2)));

    return {
      taskId: task.id,
      originalScore: baselineScore,
      aiAdjustment,
      finalScore,
      urgencyScore,
      userPriorityScore
    };
  }
};