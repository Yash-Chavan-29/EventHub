const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
    },
    date: {
      type: Date,
      required: [true, 'Please add an event date'],
    },
    time: {
      type: String,
      required: [true, 'Please add an event time'],
    },
    venue: {
      type: String,
      required: [true, 'Please add an event venue'],
    },
    category: {
      type: String,
      required: [true, 'Please select an event category'],
      enum: ['technical', 'cultural', 'sports', 'seminar', 'other'],
      default: 'technical',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    },
    capacity: {
      type: Number,
      default: 100,
      min: [1, 'Capacity must be at least 1'],
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attendedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
