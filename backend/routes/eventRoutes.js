const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  deregisterFromEvent,
  getMyRegistrations,
  getMyOrganizedEvents,
  checkinUser,
  getAnalyticsSummary,
} = require('../controllers/eventController');
const {
  submitFeedback,
  getEventFeedback,
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get user specific event lists & analytics (must be before :id routes to avoid collision)
router.get('/my/registrations', protect, getMyRegistrations);
router.get('/my/organized', protect, authorize('organizer', 'admin'), getMyOrganizedEvents);
router.get('/analytics/summary', protect, authorize('organizer', 'admin'), getAnalyticsSummary);

// Standard CRUD & Registrations
router.route('/')
  .get(getEvents)
  .post(protect, authorize('organizer', 'admin'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorize('organizer', 'admin'), updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

router.post('/:id/register', protect, registerForEvent);
router.post('/:id/deregister', protect, deregisterFromEvent);
router.post('/:id/checkin', protect, authorize('organizer', 'admin'), checkinUser);

// Feedback routes
router.route('/:id/feedback')
  .get(getEventFeedback)
  .post(protect, submitFeedback);

module.exports = router;
