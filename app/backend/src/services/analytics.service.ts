import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const AnalyticsService = {
  getOverview: async (userId: string) => {
    const totalTasks = await prisma.task.count({ where: { userId } });
    const completedTasks = await prisma.task.count({ where: { userId, status: 'done' } });
    const pendingTasks = totalTasks - completedTasks;

    const completedVsPendingRatio = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    const completionRatePercentage = (completedVsPendingRatio * 100).toFixed(2);

    // Get overdue tasks
    const overdueTasks = await prisma.task.count({
      where: {
        userId,
        dueDate: { lt: new Date() },
        status: { not: 'done' }
      }
    });

    // Get average time to complete tasks
    const avgCompletionTime = await AnalyticsService.getAverageTaskCompletionTime(userId);

    // Get weekly activity data
    const weeklyActivity = await AnalyticsService.getWeeklyActivityHeatmap(userId);

    // Get monthly summary
    const monthlySummary = await AnalyticsService.getMonthlySummary(userId);

    // Get productivity insights
    const productivityInsights = await AnalyticsService.getProductivityInsights(userId);

    // Generate AI recommendations
    const aiRecommendations = await AnalyticsService.generateRecommendations(
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,
      weeklyActivity
    );

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completedVsPendingRatio,
      completionRatePercentage,
      avgCompletionTime,
      weeklyActivity,
      monthlySummary,
      productivityInsights,
      aiRecommendations,
    };
  },

  // Method to calculate average time to complete tasks
  getAverageTaskCompletionTime: async (userId: string) => {
    const completedTasks = await prisma.task.findMany({
      where: {
        userId,
        status: 'done',
        createdAt: { not: null },
        completedAt: { not: null }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    if (completedTasks.length === 0) {
      return 0; // No completed tasks
    }

    const totalDuration = completedTasks.reduce((total, task) => {
      if (!task.createdAt || !task.completedAt) return total;
      return total + (task.completedAt.getTime() - task.createdAt.getTime());
    }, 0);

    const avgDurationMs = totalDuration / completedTasks.length;
    // Convert to days
    const avgDurationDays = avgDurationMs / (1000 * 60 * 60 * 24);

    return parseFloat(avgDurationDays.toFixed(2));
  },

  // Helper to generate weekly activity data
  getWeeklyActivityHeatmap: async (userId: string) => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const tasksCompletedLastWeek = await prisma.task.findMany({
      where: {
        userId,
        status: 'done',
        updatedAt: {
          gte: oneWeekAgo,
          lte: today,
        },
      },
      select: {
        updatedAt: true,
      },
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const activityMap: { [key: string]: { date: string, dayName: string, tasksCompleted: number } } = {};

    // Initialize map for the last 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      activityMap[dateString] = { date: dateString, dayName, tasksCompleted: 0 };
    }

    // Populate with completed tasks
    tasksCompletedLastWeek.forEach(task => {
      const dateString = task.updatedAt.toISOString().split('T')[0];
      if (activityMap[dateString]) {
        activityMap[dateString].tasksCompleted++;
      }
    });

    // Convert to array and sort by date
    return Object.values(activityMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  // Method to get monthly summary
  getMonthlySummary: async (userId: string) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const tasksThisMonth = await prisma.task.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      }
    });

    const completedThisMonth = await prisma.task.count({
      where: {
        userId,
        status: 'done',
        updatedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      }
    });

    return {
      tasksCreated: tasksThisMonth,
      tasksCompleted: completedThisMonth,
    };
  },

  // Get productivity insights
  getProductivityInsights: async (userId: string) => {
    // Get tasks created in the last week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const tasksCreatedLastWeek = await prisma.task.count({
      where: {
        userId,
        createdAt: {
          gte: lastWeek
        }
      }
    });

    const tasksCompletedLastWeek = await prisma.task.count({
      where: {
        userId,
        status: 'done',
        updatedAt: {
          gte: lastWeek
        }
      }
    });

    const completionRate = tasksCreatedLastWeek > 0
      ? parseFloat(((tasksCompletedLastWeek / tasksCreatedLastWeek) * 100).toFixed(2))
      : 0;

    // Determine most productive day based on completion date
    const completedTasksByDay = await prisma.task.findMany({
      where: {
        userId,
        status: 'done',
        completedAt: {
          gte: lastWeek
        }
      },
      select: {
        completedAt: true
      }
    });

    let mostProductiveDay = '';
    let maxTasks = 0;

    if (completedTasksByDay.length > 0) {
      // Group tasks by day of week
      const dayCounts: { [key: string]: number } = {};
      for (const task of completedTasksByDay) {
        if (!task.completedAt) continue;
        const dayName = task.completedAt.toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;

        if (dayCounts[dayName] > maxTasks) {
          maxTasks = dayCounts[dayName];
          mostProductiveDay = dayName;
        }
      }
    }

    return {
      completionRateLastWeek: completionRate,
      tasksCreatedLastWeek,
      tasksCompletedLastWeek,
      mostProductiveDay: mostProductiveDay || 'Not enough data',
      productivityTrend: completionRate > 70 ? 'high' : completionRate > 40 ? 'medium' : 'low'
    };
  },

  // Generate AI recommendations based on analytics
  generateRecommendations: async (
    totalTasks: number,
    pendingTasks: number,
    completedTasks: number,
    overdueTasks: number,
    weeklyActivity: any[]
  ) => {
    const recommendations: string[] = [];

    if (overdueTasks > 0) {
      recommendations.push(`You have ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}. Consider reprioritizing these items.`);
    }

    if (pendingTasks > totalTasks * 0.7 && totalTasks > 5) {
      recommendations.push('Consider reviewing your task load; a high percentage of tasks are still pending.');
    }

    if (weeklyActivity.some(day => day.tasksCompleted === 0)) {
      recommendations.push('Maintain consistency! There were days this week with no tasks completed.');
    }

    const completedRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    if (completedRate > 80) {
      recommendations.push('Excellent work! Your completion rate is very high.');
    } else if (completedRate < 50) {
      recommendations.push('Try to increase your task completion rate by focusing on fewer tasks at a time.');
    }

    if (totalTasks === 0) {
      recommendations.push('Get started by creating your first tasks!');
    } else if (recommendations.length === 0) {
      recommendations.push('Keep up the great work! Your task management looks efficient.');
    }

    return recommendations;
  }
};