import express from 'express';
import {
  getSwappableSlots,
  getMySwappableSlots,
  createSwapRequest,
  getIncomingRequests,
  getOutgoingRequests,
  respondToSwapRequest
} from '../controllers/swap.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/swappable-slots', getSwappableSlots);
router.get('/my-swappable-slots', getMySwappableSlots);
router.post('/swap-request', createSwapRequest);
router.get('/incoming', getIncomingRequests);
router.get('/outgoing', getOutgoingRequests);
router.post('/swap-response/:requestId', respondToSwapRequest);

export default router;