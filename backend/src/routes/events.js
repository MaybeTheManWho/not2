const express = require('express');
const { check } = require('express-validator');
const eventsController = require('../controllers/events');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// @route   GET api/events
// @desc    Get all events
// @access  Private
router.get('/', eventsController.getEvents);

// @route   GET api/events/date/:date
// @desc    Get events for a specific date
// @access  Private
router.get('/date/:date', eventsController.getEventsByDate);

// @route   POST api/events
// @desc    Create a new event
// @access  Private
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('date', 'Valid date is required').isISO8601().toDate()
  ],
  eventsController.createEvent
);

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private
router.put(
  '/:id',
  eventsController.updateEvent
);

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', eventsController.deleteEvent);

module.exports = router;
