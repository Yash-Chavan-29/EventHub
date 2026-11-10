const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { createNotificationHelper } = require('./notificationController');

const escapeRegex = (str = '') => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, category, image, capacity } = req.body;

    if (!title || !description || !date || !time || !venue || !category) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check double-booking: venue availability at the same date & time
    const conflictingEvent = await Event.findOne({
      venue: { $regex: new RegExp(`^${escapeRegex(venue.trim())}$`, 'i') },
      date: new Date(date),
      time: time.trim(),
      status: { $ne: 'cancelled' },
    });

    if (conflictingEvent) {
      return res.status(400).json({ message: 'Venue is already booked for this date and time.' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      venue,
      category,
      organizer: req.user.id,
      image,
      capacity: capacity ? Number(capacity) : 100,
    });

    // Notify organizer about successful creation
    await createNotificationHelper(
      req.user.id,
      'Event Created Successfully',
      `Your event "${title}" has been created and scheduled at ${venue}.`,
      'success'
    );

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events (with optional filtering)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: escapeRegex(search), $options: 'i' };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 }); // Sort by date ascending

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public (email/SRN roster details restricted to event organizer or admin)
const getEventById = async (req, res) => {
  try {
    let viewer = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(
          authHeader.split(' ')[1],
          process.env.JWT_SECRET || 'fallback_jwt_secret_key_12345'
        );
        viewer = await User.findById(decoded.id).select('_id role');
      } catch {
        viewer = null;
      }
    }

    const rawEvent = await Event.findById(req.params.id).select('organizer');
    if (!rawEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const canSeeRosterPII = Boolean(
      viewer && (viewer.role === 'admin' || rawEvent.organizer.toString() === viewer._id.toString())
    );
    const rosterFields = canSeeRosterPII ? 'name email role srn' : 'name role';

    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('registeredUsers', rosterFields)
      .populate('attendedUsers', rosterFields);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer who created it, or Admin)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Check double-booking if venue, date, or time is being updated
    const checkVenue = req.body.venue !== undefined ? req.body.venue : event.venue;
    const checkDate = req.body.date !== undefined ? new Date(req.body.date) : event.date;
    const checkTime = req.body.time !== undefined ? req.body.time : event.time;

    if (req.body.venue !== undefined || req.body.date !== undefined || req.body.time !== undefined) {
      const conflictingEvent = await Event.findOne({
        _id: { $ne: event._id },
        venue: { $regex: new RegExp(`^${escapeRegex(checkVenue.trim())}$`, 'i') },
        date: checkDate,
        time: checkTime.trim(),
        status: { $ne: 'cancelled' },
      });

      if (conflictingEvent) {
        return res.status(400).json({ message: 'Venue is already booked for this date and time.' });
      }
    }

    const allowedUpdates = {};
    const updatableFields = ['title', 'description', 'date', 'time', 'venue', 'category', 'image', 'capacity', 'status'];
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        allowedUpdates[field] = req.body[field];
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    // Notify registered users about the update
    const notificationPromises = event.registeredUsers.map(userId =>
      createNotificationHelper(
        userId,
        'Event Details Updated',
        `The event "${event.title}" you registered for has been updated. Check the new details.`,
        'warning'
      )
    );
    await Promise.all(notificationPromises);

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete/Cancel an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer who created it, or Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Notify registered users about cancellation
    const notificationPromises = event.registeredUsers.map(userId =>
      createNotificationHelper(
        userId,
        'Event Cancelled',
        `The event "${event.title}" has been cancelled by the organizer.`,
        'warning'
      )
    );
    await Promise.all(notificationPromises);

    // Clean up user registrations
    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );

    // Delete feedback associated with this event
    await Feedback.deleteMany({ event: event._id });

    await Event.deleteOne({ _id: event._id });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Can only register for upcoming events' });
    }

    // Check if user is already registered
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check if event is full
    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ message: 'This event has reached full capacity' });
    }

    // Register user to event
    event.registeredUsers.push(req.user.id);
    await event.save();

    // Add event to user's registeredEvents list
    const user = await User.findById(req.user.id);
    if (user) {
      if (!user.registeredEvents.includes(event._id)) {
        user.registeredEvents.push(event._id);
        await user.save();
      }
    }

    // Notify student & organizer
    await createNotificationHelper(
      req.user.id,
      'Registration Confirmed',
      `You registered successfully for "${event.title}".`,
      'success'
    );
    await createNotificationHelper(
      event.organizer,
      'New Registration',
      `A student (${user.name}) registered for your event "${event.title}".`,
      'info'
    );

    res.json({ message: 'Successfully registered for event', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deregister/Cancel registration for an event
// @route   POST /api/events/:id/deregister
// @access  Private
const deregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    // Remove user from event
    event.registeredUsers = event.registeredUsers.filter(
      (userId) => userId.toString() !== req.user.id
    );
    // Also remove from attended if somehow checked in
    event.attendedUsers = event.attendedUsers.filter(
      (userId) => userId.toString() !== req.user.id
    );
    await event.save();

    // Remove event from user's registeredEvents list
    const user = await User.findById(req.user.id);
    if (user) {
      user.registeredEvents = user.registeredEvents.filter(
        (eventId) => eventId.toString() !== event._id.toString()
      );
      await user.save();
    }

    // Notify organizer
    await createNotificationHelper(
      event.organizer,
      'Registration Cancelled',
      `A student (${user.name}) deregistered from your event "${event.title}".`,
      'info'
    );

    res.json({ message: 'Successfully cancelled event registration', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's registered events
// @route   GET /api/events/my/registrations
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    const events = await Event.find({ registeredUsers: req.user.id })
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get events organized by logged-in user
// @route   GET /api/events/my/organized
// @access  Private (Organizer/Admin)
const getMyOrganizedEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .populate('registeredUsers', 'name email role srn')
      .populate('attendedUsers', 'name email role srn')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check-in/verify attendee for an event
// @route   POST /api/events/:id/checkin
// @access  Private (Organizer/Admin)
const checkinUser = async (req, res) => {
  try {
    const { identifier } = req.body; // Can be userId, email, or srn
    if (!identifier) {
      return res.status(400).json({ message: 'Please provide a User ID, Email, or SRN to check in.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to check in attendees for this event' });
    }

    // Find the user by id, email, or srn
    let searchCriteria = [];
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      searchCriteria.push({ _id: identifier });
    }
    searchCriteria.push({ email: identifier.toLowerCase().trim() });
    searchCriteria.push({ srn: identifier.toUpperCase().trim() });

    const user = await User.findOne({ $or: searchCriteria });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is registered
    if (!event.registeredUsers.includes(user._id)) {
      return res.status(400).json({ message: `User ${user.name} is not registered for this event.` });
    }

    // Check if already checked in
    if (event.attendedUsers.includes(user._id)) {
      return res.status(400).json({ message: `User ${user.name} is already checked in.` });
    }

    // Add to checked in list
    event.attendedUsers.push(user._id);
    await event.save();

    // Create notification for student
    await createNotificationHelper(
      user._id,
      'Event Check-in Confirmed!',
      `You have been checked in successfully for "${event.title}". Thank you for attending!`,
      'success'
    );

    res.json({
      message: `Successfully checked in ${user.name}!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        srn: user.srn,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics (Total registrations, categories breakdown, seat fill rate, ratings)
// @route   GET /api/events/analytics/summary
// @access  Private (Organizer/Admin)
const getAnalyticsSummary = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'organizer') {
      query.organizer = req.user.id;
    }

    const events = await Event.find(query);
    const eventIds = events.map(e => e._id);

    let totalCapacity = 0;
    let totalRegistrations = 0;
    let totalAttended = 0;
    const categoryCounts = {
      technical: 0,
      cultural: 0,
      sports: 0,
      seminar: 0,
      other: 0,
    };

    events.forEach(event => {
      totalCapacity += event.capacity;
      totalRegistrations += event.registeredUsers.length;
      totalAttended += event.attendedUsers.length;
      if (categoryCounts[event.category] !== undefined) {
        categoryCounts[event.category] += event.registeredUsers.length;
      } else {
        categoryCounts.other += event.registeredUsers.length;
      }
    });

    const feedbacks = await Feedback.find({ event: { $in: eventIds } });
    let totalRating = 0;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(f => {
      totalRating += f.rating;
      if (ratingCounts[f.rating] !== undefined) {
        ratingCounts[f.rating]++;
      }
    });

    const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

    res.json({
      totalEvents: events.length,
      totalCapacity,
      totalRegistrations,
      totalAttended,
      averageRating: Number(averageRating),
      totalReviews: feedbacks.length,
      categoryCounts,
      ratingCounts,
      fillRate: totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0,
      attendanceRate: totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
