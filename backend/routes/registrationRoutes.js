import { Router } from 'express';
import { body } from 'express-validator';
import {
  cancelInternal,
  eventbriteIntent,
  eventbriteList,
  myRegistrations,
  registerInternal,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/internal/:eventId', protect, registerInternal);
router.post('/internal/:eventId/cancel', protect, cancelInternal);
router.get('/me', protect, myRegistrations);
router.post(
  '/eventbrite/intent',
  protect,
  [body('eventbriteEventId').notEmpty().withMessage('eventbriteEventId is required')],
  eventbriteIntent
);
router.get('/eventbrite/me', protect, eventbriteList);

export default router;
