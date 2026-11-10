import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glow} />
      <div className="glass-panel animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Enter your cosmic credentials to continue</p>
        </div>

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="you@college.edu"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={styles.labelRow}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            New to the system?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              Create an account
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
    background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
    zIndex: -1,
  },
  card: {
    width: '100%',
    maxWidth: '450px',
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
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
};

export default Login;
