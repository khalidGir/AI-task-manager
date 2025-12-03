import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware); // All event routes require authentication

router.get('/', EventController.getAll);

export default router;