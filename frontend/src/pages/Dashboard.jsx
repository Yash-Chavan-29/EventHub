import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import EventCard from '../components/EventCard';
import CertificateModal from '../components/CertificateModal';
import { CategoryDoughnut, RatingsBarChart } from '../components/SVGCharts';
import { QRCodeSVG } from 'qrcode.react';

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals and interactions state
  const [selectedTicketEvent, setSelectedTicketEvent] = useState(null);
  const [certEvent, setCertEvent] = useState(null);
  
  // Feedback submission state
  const [feedbackEventId, setFeedbackEventId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      if (user.role === 'student') {
        const registered = await api.get('/events/my/registrations');
        setEvents(registered);
      } else {
        const organized = await api.get('/events/my/organized');
        setEvents(organized);
        
        // Fetch analytics
        const stats = await api.get('/events/analytics/summary');
        setAnalytics(stats);
      }
    } catch (err) {
      setErrorMsg('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to cancel and delete the event: "${title}"?`)) {
      try {
        await api.delete(`/events/${id}`);
        setSuccessMsg(`Successfully deleted event "${title}"`);
        setEvents(events.filter((e) => e._id !== id));
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to delete event');
        setTimeout(() => setErrorMsg(null), 3000);
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) return;

    try {
      setFeedbackLoading(true);
      setErrorMsg(null);
      await api.post(`/events/${feedbackEventId}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment,
      });

      setSuccessMsg('Feedback submitted successfully. Thank you!');
      setFeedbackEventId(null);
      setFeedbackComment('');
      setFeedbackRating(5);
      
      // Refresh dashboard
      await fetchDashboardData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={styles.page}>
      {/* Welcome Header Banner */}
      <header style={styles.header}>
        <div style={styles.headerGlow} />
        <div>
          <h1 style={styles.title}>Control Center</h1>
          <p style={styles.subtitle}>
            Manage your credentials and event timelines, <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{user.name}</span>
          </p>
        </div>

        {user.role !== 'student' && (
          <Link to="/events/create" className="btn btn-primary" style={styles.createBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Host New Event
          </Link>
        )}
      </header>

      {/* Notifications */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      {/* Statistics Cards */}
      <section style={styles.statsSection}>
        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.statIconWrapper, background: 'rgba(99, 102, 241, 0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <span style={styles.statLabel}>System Role</span>
            <h3 style={{ ...styles.statValue, textTransform: 'capitalize' }}>{user.role}</h3>
          </div>
        </div>

        {user.role === 'student' ? (
          <>
            <div className="glass-panel" style={styles.statCard}>
              <div style={{ ...styles.statIconWrapper, background: 'rgba(168, 85, 247, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <span style={styles.statLabel}>Registered Events</span>
                <h3 style={styles.statValue}>{events.length}</h3>
              </div>
            </div>

            <div className="glass-panel" style={styles.statCard}>
              <div style={{ ...styles.statIconWrapper, background: 'rgba(16, 185, 129, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <span style={styles.statLabel}>Upcoming Timelines</span>
                <h3 style={styles.statValue}>
                  {events.filter((e) => new Date(e.date) >= new Date()).length}
                </h3>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-panel" style={styles.statCard}>
              <div style={{ ...styles.statIconWrapper, background: 'rgba(168, 85, 247, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                </svg>
              </div>
              <div>
                <span style={styles.statLabel}>Events Hosted</span>
                <h3 style={styles.statValue}>{events.length}</h3>
              </div>
            </div>

            <div className="glass-panel" style={styles.statCard}>
              <div style={{ ...styles.statIconWrapper, background: 'rgba(16, 185, 129, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <span style={styles.statLabel}>Total Bookings</span>
                <h3 style={styles.statValue}>{analytics ? analytics.totalRegistrations : 0}</h3>
              </div>
            </div>

            <div className="glass-panel" style={styles.statCard}>
              <div style={{ ...styles.statIconWrapper, background: 'rgba(244, 63, 94, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <span style={styles.statLabel}>Attendance Rate</span>
                <h3 style={styles.statValue}>{analytics ? `${analytics.attendanceRate}%` : '0%'}</h3>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Visual Analytics Charts Section (Organizer / Admin only) */}
      {user.role !== 'student' && analytics && (
        <section className="analytics-grid">
          <div className="glass-panel chart-card">
            <h3 className="chart-title">Registrations Category Breakdown</h3>
            <CategoryDoughnut categoryCounts={analytics.categoryCounts} />
          </div>

          <div className="glass-panel chart-card">
            <h3 className="chart-title">Review Ratings Breakdown (Avg: {analytics.averageRating} ★)</h3>
            <RatingsBarChart ratingCounts={analytics.ratingCounts} totalReviews={analytics.totalReviews} />
          </div>
        </section>
      )}

      {/* Main Panel Content */}
      <main style={styles.mainGrid}>
        {loading ? (
          <div style={styles.loaderBox}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>Synchronizing workspace...</p>
          </div>
        ) : (
          <div className="glass-panel" style={styles.panelCard}>
            <h2 style={styles.panelTitle}>
              {user.role === 'student' ? 'Your Registered Events' : 'Events Managed by You'}
            </h2>

            {events.length > 0 ? (
              user.role === 'student' ? (
                /* Student Listings (Extended with Ticket & Certificates Options) */
                <div style={styles.studentGrid}>
                  {events.map((event) => {
                    const isUpcoming = new Date(event.date) >= new Date();
                    const hasAttended = event.attendedUsers && event.attendedUsers.includes(user.id);
                    
                    return (
                      <div key={event._id} className="glass-panel animate-fade-in" style={styles.studentCardContainer}>
                        <EventCard event={event} />
                        <div style={styles.cardActionsFooter}>
                          {isUpcoming ? (
                            <button
                              onClick={() => setSelectedTicketEvent(event)}
                              className="btn btn-primary"
                              style={{ width: '100%', fontSize: '13px', padding: '10px 0' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              View Ticket QR
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                              {hasAttended ? (
                                <button
                                  onClick={() => setCertEvent(event)}
                                  className="btn btn-primary"
                                  style={{ flexGrow: 1, fontSize: '12px', padding: '8px 0' }}
                                >
                                  Certificate
                                </button>
                              ) : (
                                <button
                                  className="btn btn-secondary"
                                  style={{ flexGrow: 1, fontSize: '12px', padding: '8px 0', opacity: 0.5, cursor: 'not-allowed' }}
                                  disabled
                                >
                                  Absent
                                </button>
                              )}
                              
                              {hasAttended && (
                                <button
                                  onClick={() => setFeedbackEventId(event._id)}
                                  className="btn btn-secondary"
                                  style={{ flexGrow: 1, fontSize: '12px', padding: '8px 0' }}
                                >
                                  Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Organizer/Admin Tables */
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Title</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Bookings</th>
                        <th style={styles.th}>Attendance</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => {
                        const slots = event.registeredUsers ? event.registeredUsers.length : 0;
                        const attended = event.attendedUsers ? event.attendedUsers.length : 0;
                        const full = slots >= event.capacity;
                        return (
                          <tr key={event._id} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: '600' }}>
                              <Link to={`/events/${event._id}`} style={styles.tableLink}>
                                {event.title}
                              </Link>
                            </td>
                            <td style={styles.td}>
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td style={styles.td}>
                              <span className={`badge badge-${event.category.toLowerCase()}`}>
                                {event.category}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ color: full ? 'var(--color-accent)' : 'inherit', fontWeight: full ? '600' : 'normal' }}>
                                {slots} / {event.capacity}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span>{attended} checked-in</span>
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                textTransform: 'uppercase',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: event.status === 'upcoming' ? 'var(--color-success)' : 'var(--color-accent)',
                              }}>
                                {event.status}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.tableActions}>
                                <Link to={`/events/${event._id}/edit`} className="btn btn-secondary" style={styles.actionBtnIcon}>
                                  Edit
                                </Link>
                                <button onClick={() => handleDelete(event._id, event.title)} className="btn btn-accent" style={styles.actionBtnIconAccent}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Empty panel */
              <div style={styles.emptyPanel}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <h4>No timelines catalogued</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', maxWidth: '300px' }}>
                  {user.role === 'student' 
                    ? 'Explore and register for upcoming college events to see them catalogued here.'
                    : 'Get started by creating your very first campus event today.'}
                </p>
                {user.role === 'student' ? (
                  <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Explore Events</Link>
                ) : (
                  <Link to="/events/create" className="btn btn-primary" style={{ marginTop: '16px' }}>Host First Event</Link>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Ticket Modal Overlay */}
      {selectedTicketEvent && (
        <div className="modal-overlay" onClick={() => setSelectedTicketEvent(null)}>
          <div className="modal-content-container" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedTicketEvent(null)}>
              &times;
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Event Entrance Ticket</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Present this code at the checkpoint to confirm attendance.
            </p>
            
            <div style={styles.qrContainer}>
              <QRCodeSVG
                value={user.id}
                size={180}
                bgColor="#ffffff"
                fgColor="#0a0a0f"
                level="L"
                includeMargin={true}
              />
            </div>
            
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginTop: '16px' }}>
              {selectedTicketEvent.title}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600', marginTop: '4px' }}>
              Venue: {selectedTicketEvent.venue}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {new Date(selectedTicketEvent.date).toLocaleDateString()} at {selectedTicketEvent.time}
            </p>
            
            <div style={{ marginTop: '24px' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedTicketEvent(null)}>
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal Overlay */}
      {feedbackEventId && (
        <div className="modal-overlay" onClick={() => setFeedbackEventId(null)}>
          <div className="modal-content-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setFeedbackEventId(null)}>
              &times;
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Leave Event Feedback</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Tell us about your experience to help the organizer improve.
            </p>

            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group">
                <label className="form-label">Overall Rating</label>
                <div className="rating-stars" style={{ margin: '8px 0 16px 0' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`rating-star-btn ${feedbackRating >= star ? 'active' : ''}`}
                      onClick={() => setFeedbackRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="feedbackComment">Your Comments</label>
                <textarea
                  id="feedbackComment"
                  rows="4"
                  className="form-input"
                  placeholder="Share details of your experience..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFeedbackEventId(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal Overlay */}
      {certEvent && (
        <CertificateModal
          user={{ name: user.name, srn: user.srn }}
          event={certEvent}
          onClose={() => setCertEvent(null)}
        />
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 24px 80px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    position: 'relative',
    flexWrap: 'wrap',
    gap: '20px',
  },
  headerGlow: {
    position: 'absolute',
    left: '-20px',
    top: '-20px',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
    zIndex: -1,
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '15px',
    marginTop: '4px',
  },
  createBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    height: '42px',
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
    background: 'rgba(20, 20, 30, 0.4)',
  },
  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    lineHeight: '1.2',
    color: '#fff',
  },
  mainGrid: {
    width: '100%',
  },
  panelCard: {
    padding: '30px',
    background: 'rgba(20, 20, 30, 0.4)',
  },
  panelTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '24px',
    fontFamily: 'var(--font-display)',
  },
  loaderBox: {
    textAlign: 'center',
    padding: '50px 0',
  },
  studentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  studentCardContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
  cardActionsFooter: {
    padding: '16px 20px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderTop: '1px solid var(--border-color)',
    marginTop: 'auto',
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'var(--transition-smooth)',
    cursor: 'default',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  tableLink: {
    color: '#fff',
    fontWeight: '600',
    transition: 'var(--transition-smooth)',
  },
  tableActions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtnIcon: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '4px',
    height: '30px',
  },
  actionBtnIconAccent: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '4px',
    background: 'rgba(244, 63, 94, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    height: '30px',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    transition: 'var(--transition-smooth)',
  },
  emptyPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    textAlign: 'center',
  },
  qrContainer: {
    display: 'inline-block',
    background: '#fff',
    padding: '12px',
    borderRadius: '12px',
    margin: '0 auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
};

export default Dashboard;
