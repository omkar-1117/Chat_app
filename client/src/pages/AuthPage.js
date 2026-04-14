import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.username || !form.email || !form.password) {
          setError('All fields are required');
          return;
        }
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        await register(form.username, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-grid"></div>
      </div>

      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon-sm">⚡</span>
            <span className="auth-brand">ChatWave</span>
          </div>
          <h1 className="auth-title">
            {isLogin ? 'Welcome back' : 'Join ChatWave'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Sign in to continue your conversations'
              : 'Create your account and start chatting'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="input"
                type="text"
                name="username"
                placeholder="Choose a username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder={isLogin ? 'Enter password' : 'Create a password (min 6 chars)'}
              value={form.password}
              onChange={handleChange}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
          <button
            className="auth-switch-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setForm({ username: '', email: '', password: '' });
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <div className="auth-features">
          <div className="feature-pill">⚡ Real-time</div>
          <div className="feature-pill">🔒 Secure</div>
          <div className="feature-pill">💬 Chat rooms</div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
