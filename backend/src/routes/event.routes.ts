import express from 'express';
import { getMyEvents, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getMyEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;