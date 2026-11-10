import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'events'

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const usersData = await api.get('/auth/users');
      const eventsData = await api.get('/events'); // get all events
      
      setUsers(usersData);
      setEvents(eventsData);
    } catch (err) {
      setErrorMsg('Failed to retrieve system directories. Make sure you are logged in as administrator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      setErrorMsg(null);
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setSuccessMsg(`Successfully upgraded ${userName} to ${newRole}`);
      
      // Update local state
      setUsers(users.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to modify role.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to completely remove user "${userName}" from the system?`)) return;

    try {
      setErrorMsg(null);
      await api.delete(`/auth/users/${userId}`);
      setSuccessMsg(`Successfully deleted user "${userName}"`);
      
      // Update local state
      setUsers(users.filter((u) => u._id !== userId));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete user.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to completely cancel and delete event "${eventTitle}"?`)) return;

    try {
      setErrorMsg(null);
      await api.delete(`/events/${eventId}`);
      setSuccessMsg(`Successfully deleted event "${eventTitle}"`);
      
      // Update local state
      setEvents(events.filter((e) => e._id !== eventId));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete event.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={styles.errorContainer}>
        <div className="alert alert-error">
          Access Denied. Only administrators are authorized to access this route.
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={styles.page}>
      {/* Title */}
      <header style={styles.header}>
        <h1 style={styles.title}>System Control Board</h1>
        <p style={styles.subtitle}>Supervise users, update credentials, and audit academic events</p>
      </header>

      {/* Messages */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

      {/* Tabs Menu */}
      <div style={styles.tabMenu}>
        <button 
          onClick={() => setActiveTab('users')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'users' ? styles.activeTabBtn : {}) }}
        >
          User Accounts Directory ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('events')} 
          style={{ ...styles.tabBtn, ...(activeTab === 'events' ? styles.activeTabBtn : {}) }}
        >
          All System Events ({events.length})
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-secondary)' }}>Synchronizing system registers...</p>
        </div>
      ) : (
        <div className="glass-panel" style={styles.panelCard}>
          {activeTab === 'users' ? (
            /* Users Directory */
            <div style={styles.tableResponsive}>
              <h3 style={styles.panelTitle}>Registered User Profiles</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email Address</th>
                    <th style={styles.th}>Created Date</th>
                    <th style={styles.th}>Role Permission</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '600', color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {u.name}
                          {u.srn && (
                            <span style={{ fontSize: '10px', fontWeight: '700', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: '4px' }}>
                              {u.srn}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={styles.td}>
                        <select
                          className="form-input"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value, u.name)}
                          style={styles.roleSelect}
                          disabled={u._id === user.id} // prevent self role-change
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="btn btn-accent"
                          style={styles.actionBtn}
                          disabled={u._id === user.id} // prevent deleting oneself
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Events Audit Directory */
            <div style={styles.tableResponsive}>
              <h3 style={styles.panelTitle}>Academic Events Index</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Event Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Date & Location</th>
                    <th style={styles.th}>Roster Bookings</th>
                    <th style={styles.th}>Host Account</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e._id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '600' }}>
                        <Link to={`/events/${e._id}`} style={styles.eventLink}>
                          {e.title}
                        </Link>
                      </td>
                      <td style={styles.td}>
                        <span className={`badge badge-${e.category.toLowerCase()}`}>{e.category}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '13px', color: '#fff' }}>
                          {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.venue}</div>
                      </td>
                      <td style={styles.td}>
                        {e.registeredUsers ? e.registeredUsers.length : 0} / {e.capacity}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '13px', color: '#fff' }}>{e.organizer ? e.organizer.name : 'Unknown'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.organizer ? e.organizer.email : ''}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          textTransform: 'uppercase',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: e.status === 'upcoming' ? 'var(--color-success)' : 'var(--color-accent)',
                        }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionsCell}>
                          <Link to={`/events/${e._id}/edit`} className="btn btn-secondary" style={styles.tableBtn}>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteEvent(e._id, e.title)}
                            className="btn btn-accent"
                            style={styles.tableBtnAccent}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 24px 80px 24px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  header: {
    marginBottom: '32px',
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
  tabMenu: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  tabBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'var(--transition-smooth)',
  },
  activeTabBtn: {
    color: 'var(--color-primary)',
    borderBottom: '2px solid var(--color-primary)',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 0',
  },
  panelCard: {
    padding: '30px',
    background: 'rgba(20, 20, 30, 0.4)',
  },
  panelTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    fontFamily: 'var(--font-display)',
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
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  roleSelect: {
    padding: '6px 12px',
    fontSize: '13px',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '4px',
    background: 'rgba(244, 63, 94, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
  },
  eventLink: {
    color: '#fff',
    fontWeight: '600',
    transition: 'var(--transition-smooth)',
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
  },
  tableBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '4px',
    height: '30px',
  },
  tableBtnAccent: {
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
  },
};

export default AdminDashboard;
