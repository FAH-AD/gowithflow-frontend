import { Router } from 'express';
import { body } from 'express-validator';
import {
  createEvent,
  deleteEvent,
  getExternalEvent,
  getEvent,
  myEvents,
  publishStatus,
  searchEvents,
  updateEvent,
} from '../controllers/eventController.js';
import { maybeAuth, protect } from '../middleware/auth.js';

const router = Router();

const eventValidators = [
  body('title').notEmpty().withMessage('Title is required'),
  body('startAt').notEmpty().withMessage('Start date is required'),
];

router.get('/search', maybeAuth, searchEvents);
router.get('/external/:source/:id', maybeAuth, getExternalEvent);
router.get('/mine', protect, myEvents);
router.get('/:id', protect, getEvent);
router.post('/', protect, eventValidators, createEvent);
router.put('/:id', protect, eventValidators, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/publish', protect, publishStatus);

export default router;
