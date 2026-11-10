import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const { _id, title, date, venue, category, capacity, registeredUsers, image, status } = event;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const slotsBooked = registeredUsers ? registeredUsers.length : 0;
  const percentage = Math.min(100, Math.round((slotsBooked / capacity) * 100));
  const isFull = slotsBooked >= capacity;

  return (
    <Link to={`/events/${_id}`} className="glass-panel animate-fade-in" style={styles.card}>
      {/* Event Image Banner */}
      <div style={styles.imageContainer}>
        <img 
          src={image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'} 
          alt={title} 
          style={styles.image} 
        />
        <div style={styles.badgeOverlay}>
          <span className={`badge badge-${category.toLowerCase()}`}>{category}</span>
        </div>
        {status === 'cancelled' && (
          <div style={styles.cancelledOverlay}>
            <span style={styles.cancelledText}>CANCELLED</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={styles.content}>
        <div style={styles.dateVenueRow}>
          <div style={styles.iconText}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          <div style={styles.iconText}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={styles.truncate}>{venue}</span>
          </div>
        </div>

        <h3 style={styles.title}>{title}</h3>

        {/* Capacity Tracking */}
        <div style={styles.capacitySection}>
          <div style={styles.capacityMeta}>
            <span style={styles.slotsLabel}>
              {isFull ? (
                <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>Sold Out</span>
              ) : (
                <span>{slotsBooked} / {capacity} Registered</span>
              )}
            </span>
            <span style={styles.percentageText}>{percentage}% Full</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${percentage}%`,
                background: isFull 
                  ? 'linear-gradient(90deg, var(--color-accent), #ef4444)' 
                  : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
              }}
            />
          </div>
        </div>

        {/* View Details Prompt */}
        <div style={styles.footerRow}>
          <span style={styles.viewLink}>
            View Details
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={styles.arrow}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
    height: '180px',
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'var(--transition-smooth)',
  },
  badgeOverlay: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: 1,
  },
  cancelledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(244, 63, 94, 0.45)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  cancelledText: {
    color: '#fff',
    fontFamily: 'var(--font-display)',
    fontWeight: '900',
    fontSize: '22px',
    letterSpacing: '2px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
  },
  content: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  dateVenueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    maxWidth: '50%',
  },
  truncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
    lineHeight: '1.4',
    fontFamily: 'var(--font-display)',
    height: '50px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    color: 'var(--text-primary)',
  },
  capacitySection: {
    marginTop: 'auto',
    marginBottom: '16px',
  },
  capacityMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '6px',
  },
  slotsLabel: {
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  percentageText: {
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  footerRow: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewLink: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-primary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'var(--transition-smooth)',
  },
  arrow: {
    transition: 'transform 0.2s ease',
  },
};

export default EventCard;
