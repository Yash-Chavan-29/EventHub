import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.navContainer}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <svg style={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span style={styles.logoText}>Event<span style={{ color: 'var(--color-primary)' }}>Hub</span></span>
        </Link>

        {/* Links */}
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Events</Link>
          
          {user ? (
            <>
              <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
              
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.navLinkAdmin}>Admin Panel</Link>
              )}
              
              <div style={styles.userSection}>
                {/* Notifications Bell */}
                <div className="nav-notification-container" ref={dropdownRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="notification-bell"
                    title="Notifications"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <NotificationsDropdown
                      onUnreadCountChange={setUnreadCount}
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </div>

                <div style={styles.userBadge}>
                  <div style={styles.avatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.userName}>{user.name}</span>
                  <span style={styles.roleTag}>{user.role}</span>
                </div>
                
                <button onClick={handleLogout} className="btn btn-secondary" style={styles.logoutBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" className="btn btn-secondary" style={styles.authBtn}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={styles.authBtn}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(10, 10, 15, 0.75)',
    backdropFilter: 'var(--blur-glass)',
    borderBottom: '1px solid var(--border-color)',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '22px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.5px',
  },
  logoIcon: {
    width: '24px',
    height: '24px',
    color: 'var(--color-primary)',
  },
  logoText: {
    background: 'linear-gradient(135deg, #fff 60%, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  navLink: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    padding: '6px 12px',
    borderRadius: '8px',
    transition: 'var(--transition-smooth)',
  },
  navLinkAdmin: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f43f5e',
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    padding: '4px 12px',
    borderRadius: '50px',
    transition: 'var(--transition-smooth)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginLeft: '8px',
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '24px',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '4px 12px 4px 6px',
    borderRadius: '50px',
    border: '1px solid var(--border-color)',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  roleTag: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--color-primary)',
    background: 'rgba(99, 102, 241, 0.1)',
    padding: '1px 6px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '36px',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  authBtn: {
    padding: '8px 20px',
    fontSize: '14px',
    height: '38px',
  },
};

export default Navbar;
