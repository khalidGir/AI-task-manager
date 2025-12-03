import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware); // All analytics routes require authentication

router.get('/overview', AnalyticsController.getOverview);

export default router;