import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect all task routes with the auth middleware
router.use(authMiddleware);

router.post('/', TaskController.create);
router.get('/', TaskController.getAll);
router.patch('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);
router.patch('/:id/complete', TaskController.markCompleted);
router.patch('/:id/pending', TaskController.markPending);

export default router;