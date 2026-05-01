import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirm } = form;

    if (!name || !email || !password || !confirm) {
      return setError('Please fill in all fields.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { label: 'Weak', color: '#ff4d4d', width: '25%' };
    if (pwd.length < 10) return { label: 'Fair', color: '#ffa500', width: '50%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Good', color: '#c8b5f0', width: '75%' };
    return { label: 'Strong', color: '#4ade80', width: '100%' };
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-brand">
          <div className="brand-icon">⬡</div>
          <span className="brand-name">NexAuth</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join us — it only takes a moment</p>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              className="field-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="field-input"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                className="field-input"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {strength && (
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{ width: strength.width, background: strength.color }}
                />
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={handleChange}
              className={`field-input ${
                form.confirm && form.password !== form.confirm ? 'input-error' : ''
              } ${
                form.confirm && form.password === form.confirm && form.confirm.length > 0 ? 'input-success' : ''
              }`}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in →
          </Link>
        </p>
      </div>

      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />
    </div>
  );
};

export default RegisterPage;
