const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5002;
const BASE_URL = `http://localhost:${PORT}`;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-events';

test('College Event System API Integration Tests', async (t) => {
  // Connect to DB for setup/cleanup verification
  await mongoose.connect(MONGO_URI);

  // Test data definitions
  const testStudentEmail = `test_student_${Date.now()}@example.com`;
  const testOrganizerEmail = `test_organizer_${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  let studentToken = '';
  let studentId = '';
  let organizerToken = '';
  let organizerId = '';
  let eventId = '';

  // Cleanup helper
  const cleanup = async () => {
    console.log('Cleaning up test data from database...');
    if (studentId) {
      await User.deleteOne({ _id: studentId });
      await Notification.deleteMany({ user: studentId });
    }
    if (organizerId) {
      await User.deleteOne({ _id: organizerId });
      await Notification.deleteMany({ user: organizerId });
    }
    if (eventId) {
      await Event.deleteOne({ _id: eventId });
      await Feedback.deleteMany({ event: eventId });
    }
    // Clean up any stray users with test emails
    await User.deleteMany({ email: { $in: [testStudentEmail, testOrganizerEmail] } });
  };

  // Register cleanup hook
  t.after(async () => {
    await cleanup();
    await mongoose.connection.close();
    console.log('Database connection closed.');
  });

  // Ensure fresh start
  await cleanup();

  await t.test('1. Root endpoint health check', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.match(text, /College Event Management API is running/);
  });

  await t.test('2. Get events (public access)', async () => {
    const res = await fetch(`${BASE_URL}/api/events`);
    assert.strictEqual(res.status, 200);
    const events = await res.json();
    assert.strictEqual(Array.isArray(events), true);
  });

  await t.test('3. Register student user', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: testStudentEmail,
        password: testPassword,
        role: 'student',
        srn: `TST${Date.now().toString().slice(-6)}`
      }),
    });
    
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.strictEqual(data.role, 'student');
    studentToken = data.token;
    studentId = data._id;
  });

  await t.test('4. Register organizer user', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Organizer',
        email: testOrganizerEmail,
        password: testPassword,
        role: 'organizer'
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.strictEqual(data.role, 'organizer');
    organizerToken = data.token;
    organizerId = data._id;
  });

  await t.test('5. Login student user', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: testPassword,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    assert.strictEqual(data.email, testStudentEmail);
  });

  await t.test('6. Fetch user profile with valid JWT', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.email, testStudentEmail);
  });

  await t.test('7. Deny unauthorized actions (Create Event without token)', async () => {
    const res = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthorized Event',
        description: 'Should fail',
        date: new Date('2026-10-10'),
        time: '10:00 AM',
        venue: 'Main Auditorium',
        category: 'technical',
      }),
    });
    assert.strictEqual(res.status, 401);
  });

  await t.test('8. Create event as Organizer', async () => {
    const res = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`,
      },
      body: JSON.stringify({
        title: `Test Integration Hackathon ${Date.now()}`,
        description: 'A test event created during automated integration runs.',
        date: new Date('2026-11-12T10:00:00.000Z'),
        time: '09:00 AM - 05:00 PM',
        venue: `Test Venue Room ${Date.now()}`,
        category: 'technical',
        capacity: 10,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data._id);
    eventId = data._id;
  });

  await t.test('9. Register student for event', async () => {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.match(data.message, /Successfully registered/i);
  });

  await t.test('10. Organizer check-in student', async () => {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${organizerToken}`,
      },
      body: JSON.stringify({ identifier: studentId }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.match(data.message, /Successfully checked in/i);
  });

  await t.test('11. Submit event feedback as student', async () => {
    const res = await fetch(`${BASE_URL}/api/events/${eventId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Amazing test experience!',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.rating, 5);
    assert.strictEqual(data.comment, 'Amazing test experience!');
  });
});
