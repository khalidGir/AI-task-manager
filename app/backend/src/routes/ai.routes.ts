import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect the route with auth middleware
router.use(authMiddleware);

router.post('/prioritize', AiController.prioritize);

export default router;