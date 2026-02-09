import { Router } from 'express';
import { body } from 'express-validator';
import {
  connectEventbrite,
  eventbriteCallback,
  listEventbriteOrgs,
  publishToEventbrite,
  setPreferredOrg,
} from '../controllers/integrationController.js';
import { handleEventbriteWebhook } from '../controllers/registrationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/eventbrite/connect', protect, connectEventbrite);
router.get('/eventbrite/callback', eventbriteCallback);
router.get('/eventbrite/orgs', protect, listEventbriteOrgs);
router.post(
  '/eventbrite/publish/:internalEventId',
  protect,
  [body('orgId').optional().isString().withMessage('orgId must be string')],
  publishToEventbrite
);
router.post(
  '/eventbrite/preferred-org',
  protect,
  [body('orgId').notEmpty().withMessage('orgId required')],
  setPreferredOrg
);
router.post('/eventbrite/webhook', handleEventbriteWebhook);

export default router;
