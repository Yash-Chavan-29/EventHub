import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import AdminDashboard from './pages/AdminDashboard';

// Custom Route Guard for general logged-in sessions
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Authenticating cosmic signal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route Guard for Organizer/Admin specific actions
const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Route Guard for Admin-only panels
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <Router>
      <div style={styles.layoutWrapper}>
        <Navbar />

        {/* Main Content Area */}
        <div style={styles.contentBody}>
          <Routes>
            {/* Public paths */}
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* General authenticated paths */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Organizer and admin actions */}
            <Route
              path="/events/create"
              element={
                <ProtectedRoute>
                  <StaffRoute>
                    <CreateEvent />
                  </StaffRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id/edit"
              element={
                <ProtectedRoute>
                  <StaffRoute>
                    <EditEvent />
                  </StaffRoute>
                </ProtectedRoute>
              }
            />

            {/* Admin only control board */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />

            {/* Redirect everything else to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Premium footer */}
        <footer style={styles.footer}>
          <div className="container" style={styles.footerContainer}>
            <p style={{ color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} EventHub. Coordinating campus synergy, hackathons, and culture.
            </p>
            <div style={styles.footerLinks}>
              <Link to="/" style={styles.footerLink}>Exploration</Link>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={styles.footerLink}>GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = {
  layoutWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  contentBody: {
    flexGrow: 1,
  },
  loadingWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    background: '#07070a',
    borderTop: '1px solid var(--border-color)',
    padding: '24px 0',
    marginTop: 'auto',
  },
  footerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '13px',
  },
  footerLinks: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  footerLink: {
    color: 'var(--text-secondary)',
    transition: 'var(--transition-smooth)',
    '&:hover': {
      color: 'var(--color-primary)',
    }
  },
};

export default App;
