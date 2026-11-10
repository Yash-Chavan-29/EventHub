const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const { createNotificationHelper } = require('./notificationController');

// @desc    Submit feedback for an event
// @route   POST /api/events/:id/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const eventId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide a rating and a comment' });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Must be registered
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You must be registered for this event to leave feedback' });
    }

    // Must have attended (check in attendedUsers array)
    if (!event.attendedUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You must have checked in/attended this event to leave feedback' });
    }

    // Check if already submitted
    const existingFeedback = await Feedback.findOne({ event: eventId, user: req.user.id });
    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' });
    }

    const feedback = await Feedback.create({
      event: eventId,
      user: req.user.id,
      rating: Number(rating),
      comment,
    });

    // Notify organizer about feedback
    await createNotificationHelper(
      event.organizer,
      'New Event Feedback',
      `A participant left a ${rating}-star review for your event "${event.title}".`,
      'info'
    );

    res.status(201).json(feedback);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all feedback for an event
// @route   GET /api/events/:id/feedback
// @access  Public
const getEventFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ event: req.params.id })
      .populate('user', 'name srn')
      .sort({ createdAt: -1 });

    res.json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitFeedback,
  getEventFeedback,
};
