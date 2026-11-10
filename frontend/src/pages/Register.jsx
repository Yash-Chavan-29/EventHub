import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [srn, setSrn] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (role === 'student' && !srn) {
      setErrorMsg('Please enter your Student Registration Number (SRN).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await register(name, email, password, role, role === 'student' ? srn : undefined);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Email might already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glow} />
      <div className="glass-panel animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Join EventHub</h2>
          <p style={styles.subtitle}>Create your profile to explore college synergy</p>
        </div>

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="Alex Johnson"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="alex@college.edu"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Role selector tabs */}
          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={styles.roleTabs}>
              <button
                type="button"
                onClick={() => setRole('student')}
                style={{
                  ...styles.roleTabBtn,
                  ...(role === 'student' ? styles.activeRoleTabBtn : {}),
                }}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                style={{
                  ...styles.roleTabBtn,
                  ...(role === 'organizer' ? styles.activeRoleTabBtn : {}),
                }}
              >
                Organizer
              </button>
            </div>
            <p style={styles.roleTip}>
              {role === 'student' 
                ? 'Allows you to discover and register for events hosted on campus.'
                : 'Allows you to create, coordinate, and review registrations for your own events.'}
            </p>
          </div>

          {role === 'student' && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Student Registration Number (SRN) *</label>
              <input
                type="text"
                placeholder="e.g. 01FE24BCA001"
                className="form-input"
                value={srn}
                onChange={(e) => setSrn(e.target.value)}
                required
              />
              <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                Must match your official college SRN.
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Profile...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 70px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, var(--color-secondary-glow) 0%, transparent 70%)',
    zIndex: -1,
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '40px 32px',
    background: 'rgba(20, 20, 30, 0.55)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
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
  roleTabs: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.25)',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  roleTabBtn: {
    flex: 1,
    padding: '10px 0',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    fontSize: '14px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  activeRoleTabBtn: {
    background: 'var(--color-primary)',
    color: '#fff',
    boxShadow: '0 2px 8px var(--color-primary-glow)',
  },
  roleTip: {
    marginTop: '6px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
};

export default Register;
