import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState('technical');
  const [capacity, setCapacity] = useState(100);
  const [image, setImage] = useState('');

  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !date || !time || !venue || !category) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      
      const newEvent = await api.post('/events', {
        title,
        description,
        date,
        time,
        venue,
        category,
        capacity: Number(capacity),
        image: image || undefined, // use backend default if blank
      });

      navigate(`/events/${newEvent._id}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={styles.page}>
      <div style={styles.glow} />
      <div className="glass-panel animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Host New Event</h2>
          <p style={styles.subtitle}>Define the parameters of your campus synergy</p>
        </div>

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                placeholder="e.g. Annual Technical Hackathon"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
                required
              >
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="seminar">Seminar</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              placeholder="Provide a comprehensive breakdown of the event, itinerary, and registration requirements..."
              className="form-input"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              required
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Time *</label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM - 4:00 PM"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Venue *</label>
              <input
                type="text"
                placeholder="e.g. Seminar Hall C, Main Campus"
                className="form-input"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Capacity (Seats)</label>
              <input
                type="number"
                min="1"
                placeholder="100"
                className="form-input"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image URL</label>
            <input
              type="url"
              placeholder="e.g. https://images.unsplash.com/... (optional)"
              className="form-input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <p style={styles.fieldTip}>
              Leave blank to auto-generate a high-fidelity generic banner matching category styles.
            </p>
          </div>

          {/* Form Actions */}
          <div style={styles.actionsRow}>
            <Link to="/dashboard" className="btn btn-secondary" style={styles.formBtn}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              style={styles.formBtn}
              disabled={submitting}
            >
              {submitting ? 'Cataloguing Event...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 24px 80px 24px',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
    zIndex: -1,
  },
  card: {
    width: '100%',
    maxWidth: '750px',
    padding: '40px 32px',
    background: 'rgba(20, 20, 30, 0.55)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  select: {
    cursor: 'pointer',
    appearance: 'none',
    background: 'rgba(255, 255, 255, 0.03) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 16px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'var(--font-sans)',
  },
  fieldTip: {
    marginTop: '6px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '24px',
    marginTop: '12px',
  },
  formBtn: {
    padding: '12px 24px',
    fontSize: '14px',
  },
};

export default CreateEvent;
