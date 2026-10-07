import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { LockOutlined, UserOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      const { data } = await API.post('/admin/auth/login', { username: cleanUsername, password: cleanPassword });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />
      <div className="login-bg-orb login-bg-orb--3" />

      {/* Grid pattern overlay */}
      <div className="login-grid-overlay" />

      <div className="login-container">
        {/* Left - Branding panel */}
        <div className="login-brand-panel">
          <div className="login-brand-content">
            <img src="/logo-white.png" alt="UniCoach" style={{ height: 44, width: 'auto', marginBottom: 16, objectFit: 'contain' }} />
            <p className="login-brand-subtitle" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.85, fontWeight: 700 }}>Admin Control Panel</p>
            <div className="login-brand-divider" />
            <p className="login-brand-desc">
              Manage your platform content, users, and analytics from one powerful dashboard.
            </p>
            <div className="login-brand-features">
              <div className="login-brand-feature">
                <div className="login-brand-feature-icon">📊</div>
                <span>Real-time Analytics</span>
              </div>
              <div className="login-brand-feature">
                <div className="login-brand-feature-icon">📝</div>
                <span>Content Management</span>
              </div>
              <div className="login-brand-feature">
                <div className="login-brand-feature-icon">👥</div>
                <span>User Management</span>
              </div>
            </div>
          </div>
          <div className="login-brand-footer">
            <p>© 2026 UniCoach. All rights reserved.</p>
          </div>
        </div>

        {/* Right - Login form */}
        <div className="login-form-panel">
          <div className="login-form-wrapper">
            {/* Mobile logo */}
            <div className="login-mobile-logo" style={{ marginBottom: 20 }}>
              <img src="/logo.png" alt="UniCoach" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
            </div>

            <div className="login-form-header">
              <h2 className="login-form-title">Welcome back</h2>
              <p className="login-form-subtitle">Enter your credentials to access the admin panel</p>
            </div>

            {error && (
              <div className="login-error" id="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label className="login-label" htmlFor="login-username">Username</label>
                <div className="login-input-wrapper">
                  <UserOutlined className="login-input-icon" />
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    className="login-input"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">Password</label>
                <div className="login-input-wrapper">
                  <LockOutlined className="login-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="login-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-password-toggle"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className={`login-submit-btn ${loading ? 'login-submit-btn--loading' : ''}`}
              >
                {loading ? (
                  <span className="login-spinner" />
                ) : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <LockOutlined style={{ fontSize: 11, opacity: 0.5 }} />
              <span>Secured with end-to-end encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
