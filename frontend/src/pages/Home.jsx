import React, { useState, useEffect } from 'react';
import api from '../api/api';
import EventCard from '../components/EventCard';
import EventCalendar from '../components/EventCalendar';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Fetch all events by default. We can pass query parameters
        const data = await api.get(`/events?category=${categoryFilter}&search=${searchTerm}`);
        setEvents(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, categoryFilter]);

  const categories = ['all', 'technical', 'cultural', 'sports', 'seminar', 'other'];

  return (
    <div style={styles.page}>
      {/* Hero Banner Section */}
      <section style={styles.heroSection}>
        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroGlow1} />
          <div style={styles.heroGlow2} />
          <h1 style={styles.heroTitle}>
            Unleash the Synergy of <br />
            <span style={styles.gradientText}>Campus Life</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Discover, register, and coordinate premier college events, hackathons, sports, and cultural festivals in one unified space.
          </p>
        </div>
      </section>

      {/* Main Exploration Section */}
      <section className="container" style={styles.mainContent}>
        {/* Controls Board */}
        <div className="glass-panel" style={styles.controlsBoard}>
          {/* Search bar */}
          <div style={styles.searchWrapper}>
            <svg style={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search stellar events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>✕</button>
            )}
          </div>

          {/* Category Tabs & View Mode Toggle */}
          <div style={styles.controlsFooter}>
            <div style={styles.tabsWrapper}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    ...styles.tabBtn,
                    ...(categoryFilter === cat ? styles.activeTabBtn : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'calendar' : 'grid')}
              className="btn btn-secondary"
              style={styles.toggleViewBtn}
            >
              {viewMode === 'grid' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Calendar View
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Grid View
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="alert alert-error" style={{ textAlign: 'center', marginTop: '20px' }}>
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>Gathering college events...</p>
          </div>
        ) : viewMode === 'calendar' ? (
          <EventCalendar events={events} />
        ) : (
          <>
            {/* Events Grid */}
            {events.length > 0 ? (
              <div style={styles.grid}>
                {events.map((event) => (
                  <div key={event._id} style={{ height: '100%' }}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="glass-panel" style={styles.emptyState}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <h3>No Cosmic Events Found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', maxWidth: '360px' }}>
                  We couldn't find any events matching your criteria. Try adjusting your search query or selecting another category.
                </p>
                <button 
                  onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }} 
                  className="btn btn-primary"
                  style={{ marginTop: '20px' }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

const styles = {
  page: {
    paddingBottom: '80px',
  },
  heroSection: {
    position: 'relative',
    padding: '80px 0 60px 0',
    textAlign: 'center',
    overflow: 'hidden',
  },
  heroContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  heroGlow1: {
    position: 'absolute',
    top: '-150px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
    zIndex: -1,
  },
  heroGlow2: {
    position: 'absolute',
    top: '-50px',
    left: '30%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--color-secondary-glow) 0%, transparent 70%)',
    zIndex: -1,
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    lineHeight: '1.2',
    marginBottom: '20px',
    color: '#fff',
  },
  gradientText: {
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary) 80%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    maxWidth: '650px',
    margin: '0 auto',
    fontWeight: '400',
  },
  mainContent: {
    marginTop: '20px',
  },
  controlsBoard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px',
    marginBottom: '40px',
    background: 'rgba(20, 20, 30, 0.4)',
  },
  searchWrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '16px 16px 16px 52px',
    fontSize: '16px',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    transition: 'var(--transition-smooth)',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '16px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '16px',
  },
  controlsFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  tabsWrapper: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '8px 18px',
    borderRadius: '50px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255, 255, 255, 0.02)',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textTransform: 'capitalize',
    transition: 'var(--transition-smooth)',
  },
  activeTabBtn: {
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: '#fff',
    boxShadow: '0 4px 12px var(--color-primary-glow)',
  },
  toggleViewBtn: {
    padding: '8px 18px',
    fontSize: '13px',
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    textAlign: 'center',
    background: 'rgba(20, 20, 30, 0.3)',
  },
};

export default Home;
