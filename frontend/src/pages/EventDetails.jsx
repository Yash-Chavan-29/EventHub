import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [checkinVal, setCheckinVal] = useState('');

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch event details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const data = await api.get(`/events/${id}/feedback`);
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to fetch feedback:', err.message);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    fetchFeedbacks();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await api.post(`/events/${id}/register`);
      setSuccessMsg(res.message || 'Successfully registered for event!');
      
      await fetchEventDetails();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeregister = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to cancel your registration for this event?')) return;

    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await api.post(`/events/${id}/deregister`);
      setSuccessMsg(res.message || 'Successfully cancelled event registration.');
      
      await fetchEventDetails();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel registration.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to completely delete "${event.title}"?`)) return;

    try {
      setActionLoading(true);
      await api.delete(`/events/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete event.');
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!checkinVal.trim()) return;
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await api.post(`/events/${id}/checkin`, { identifier: checkinVal });
      setSuccessMsg(res.message);
      setCheckinVal('');
      await fetchEventDetails();
      setTimeout(() => setSuccessMsg(null), 4500);
    } catch (err) {
      setErrorMsg(err.message || 'Check-in verification failed.');
      setTimeout(() => setErrorMsg(null), 4500);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Retrieving event dossier...</p>
      </div>
    );
  }

  if (errorMsg && !event) {
    return (
      <div className="container" style={styles.errorContainer}>
        <div className="alert alert-error" style={{ textAlign: 'center' }}>
          {errorMsg}
        </div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '20px' }}>Back to Events</Link>
      </div>
    );
  }

  if (!event) return null;

  const slotsBooked = event.registeredUsers ? event.registeredUsers.length : 0;
  const slotsAttended = event.attendedUsers ? event.attendedUsers.length : 0;
  const isFull = slotsBooked >= event.capacity;
  const isUserRegistered = user && event.registeredUsers && event.registeredUsers.some((u) => u._id === user.id);
  const isOrganizer = user && event.organizer && (event.organizer._id === user.id || event.organizer === user.id);
  const isAdmin = user && user.role === 'admin';
  const showAdminControls = isOrganizer || isAdmin;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="container" style={styles.page}>
      {/* Messages */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      <div style={styles.layout}>
        {/* Left Column: Image Banner and Details */}
        <div style={styles.leftCol}>
          <div className="glass-panel" style={styles.mediaCard}>
            <img 
              src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'} 
              alt={event.title} 
              style={styles.image}
            />
            <div style={styles.categoryOverlay}>
              <span className={`badge badge-${event.category.toLowerCase()}`}>{event.category}</span>
            </div>
            {event.status === 'cancelled' && (
              <div style={styles.cancelledOverlay}>
                <span style={styles.cancelledText}>EVENT CANCELLED</span>
              </div>
            )}
          </div>

          <div className="glass-panel" style={styles.detailsCard}>
            <h1 style={styles.title}>{event.title}</h1>
            
            <p style={styles.description}>{event.description}</p>
            
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <h4 style={styles.metaTitle}>Date</h4>
                  <p style={styles.metaVal}>{formattedDate}</p>
                </div>
              </div>

              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h4 style={styles.metaTitle}>Time</h4>
                  <p style={styles.metaVal}>{event.time}</p>
                </div>
              </div>

              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h4 style={styles.metaTitle}>Venue</h4>
                  <p style={styles.metaVal}>{event.venue}</p>
                </div>
              </div>

              <div style={styles.metaItem}>
                <div style={styles.metaIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h4 style={styles.metaTitle}>Organizer</h4>
                  <p style={styles.metaVal}>
                    {event.organizer ? event.organizer.name : 'Unknown Host'}{' '}
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      ({event.organizer ? event.organizer.email : ''})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee checkin gateway */}
          {showAdminControls && (
            <div className="glass-panel" style={styles.detailsCard}>
              <h3 style={{ ...styles.panelTitle, marginBottom: '12px' }}>Attendee Check-In Gateway</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Verify checking credentials. Type student Email, SRN, or User ID below to confirm check-in.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter Student SRN, Email, or User ID"
                  value={checkinVal}
                  onChange={(e) => setCheckinVal(e.target.value)}
                  className="form-input"
                  style={{ flexGrow: 1 }}
                />
                <button
                  onClick={handleCheckIn}
                  className="btn btn-primary"
                  style={{ padding: '0 24px', whiteSpace: 'nowrap' }}
                  disabled={actionLoading}
                >
                  Verify check-in
                </button>
              </div>
            </div>
          )}

          {/* Coordinator Section: Showing Registered Users List */}
          {showAdminControls && (
            <div className="glass-panel" style={styles.detailsCard}>
              <h3 style={{ ...styles.panelTitle, marginBottom: '16px' }}>
                Registration Roster ({slotsBooked} registered, {slotsAttended} checked in)
              </h3>
              {event.registeredUsers && event.registeredUsers.length > 0 ? (
                <div style={styles.rosterList}>
                  {event.registeredUsers.map((u, i) => {
                    const hasAttended = event.attendedUsers && event.attendedUsers.some(au => au._id === u._id);
                    return (
                      <div key={u._id || i} style={styles.rosterItem}>
                        <div style={styles.rosterAvatar}>
                          {u.name ? u.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {u.name || 'Anonymous User'}
                            {u.srn && (
                              <span style={{ fontSize: '11px', fontWeight: '600', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px' }}>
                                {u.srn}
                              </span>
                            )}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {hasAttended ? (
                            <span style={styles.attendedBadge}>
                              Checked In
                            </span>
                          ) : (
                            <span style={styles.registeredBadge}>
                              Registered
                            </span>
                          )}
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '700' }}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>
                  No participants have registered for this event yet.
                </p>
              )}
            </div>
          )}

          {/* Feedback section */}
          <div className="glass-panel" style={styles.detailsCard}>
            <h3 style={{ ...styles.panelTitle, marginBottom: '16px' }}>
              Attendee Reviews ({feedbacks.length})
            </h3>
            {feedbacks.length > 0 ? (
              <div className="feedback-list">
                {feedbacks.map((f) => (
                  <div key={f._id} className="feedback-card">
                    <div className="feedback-meta">
                      <span className="feedback-author">{f.user?.name || 'Anonymous Student'}</span>
                      <div className="rating-stars">
                        {Array.from({ length: f.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                        {Array.from({ length: 5 - f.rating }).map((_, i) => (
                          <span key={i} style={{ color: 'var(--text-muted)' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="feedback-comment">{f.comment}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>
                No feedback reviews left yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Registration Status Panel */}
        <div style={styles.rightCol}>
          <div className="glass-panel" style={styles.bookingCard}>
            <h3 style={styles.panelTitle}>Registration</h3>
            
            <div style={styles.slotsStatusRow}>
              <div>
                <span style={styles.slotsLabel}>Available Seats</span>
                <h2 style={styles.slotsValue}>{event.capacity - slotsBooked}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={styles.slotsLabel}>Capacity</span>
                <h3 style={{ ...styles.slotsValue, fontSize: '20px', color: 'var(--text-secondary)' }}>{event.capacity}</h3>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(100, Math.round((slotsBooked / event.capacity) * 100))}%` }}
                />
              </div>
              <p style={styles.percentProgress}>{Math.round((slotsBooked / event.capacity) * 100)}% Booked</p>
            </div>

            {/* Registration Actions triggers */}
            {event.status === 'cancelled' ? (
              <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                Event is Cancelled
              </button>
            ) : isUserRegistered ? (
              <button 
                onClick={handleDeregister} 
                className="btn btn-accent" 
                style={{ width: '100%', padding: '14px' }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            ) : isFull ? (
              <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                Sold Out
              </button>
            ) : (
              <button 
                onClick={handleRegister} 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px' }}
                disabled={actionLoading}
              >
                {user ? (actionLoading ? 'Booking...' : 'Register Now') : 'Log In to Register'}
              </button>
            )}

            {user && isUserRegistered && (
              <div style={styles.registeredIndicator}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>You are registered for this event</span>
              </div>
            )}
          </div>

          {/* Quick Host Panels */}
          {showAdminControls && (
            <div className="glass-panel" style={styles.adminCard}>
              <h3 style={{ ...styles.panelTitle, color: 'var(--color-accent)' }}>Host Directives</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                You have administrative access to manage or adjust details for this event.
              </p>
              <div style={styles.adminButtons}>
                <Link 
                  to={`/events/${id}/edit`} 
                  className="btn btn-secondary" 
                  style={{ flexGrow: 1, padding: '10px 0', fontSize: '14px' }}
                >
                  Edit Details
                </Link>
                <button 
                  onClick={handleDelete} 
                  className="btn btn-accent" 
                  style={{ flexGrow: 1, padding: '10px 0', fontSize: '14px' }}
                  disabled={actionLoading}
                >
                  Delete Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 24px 80px 24px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '100px 0',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '2.5fr 1fr',
    gap: '30px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  mediaCard: {
    position: 'relative',
    height: '400px',
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    top: '20px',
    left: '20px',
  },
  cancelledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(244, 63, 94, 0.55)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelledText: {
    color: '#fff',
    fontFamily: 'var(--font-display)',
    fontWeight: '950',
    fontSize: '32px',
    letterSpacing: '3px',
  },
  detailsCard: {
    padding: '30px',
    background: 'rgba(20, 20, 30, 0.4)',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    marginBottom: '20px',
    fontFamily: 'var(--font-display)',
    color: '#fff',
  },
  description: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '32px',
    whiteSpace: 'pre-line',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  metaIcon: {
    padding: '10px',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '10px',
    color: 'var(--color-primary)',
  },
  metaTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metaVal: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontWeight: '550',
    marginTop: '2px',
  },
  bookingCard: {
    padding: '24px',
    background: 'rgba(20, 20, 30, 0.4)',
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '20px',
    fontFamily: 'var(--font-display)',
  },
  slotsStatusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  slotsLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  slotsValue: {
    fontSize: '28px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    color: '#fff',
    marginTop: '2px',
  },
  percentProgress: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '6px',
    textAlign: 'right',
    fontWeight: '600',
  },
  registeredIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '16px',
    color: 'var(--color-success)',
    fontSize: '13px',
    fontWeight: '600',
  },
  adminCard: {
    padding: '24px',
    background: 'rgba(20, 20, 30, 0.4)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
  },
  adminButtons: {
    display: 'flex',
    gap: '12px',
  },
  rosterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '8px',
  },
  rosterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    background: 'rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
  },
  rosterAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--color-primary)',
  },
  attendedBadge: {
    fontSize: '11px',
    fontWeight: '600',
    background: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--color-success)',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  registeredBadge: {
    fontSize: '11px',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
  },
};

export default EventDetails;
