import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, loginAdmin } from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Admin123';

    try {
      if (email === adminEmail && password === adminPassword) {
        const response = await loginAdmin(email, password);
        if (response.message === 'Admin login successful') {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          localStorage.setItem('isAdmin', 'true');
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          navigate('/admin');
        }
        return;
      }

      const result = await loginUser(email, password);
      localStorage.setItem('token', result.token);
      localStorage.removeItem('isAdmin');
      navigate('/home');
    } catch (loginError) {
      setError('Invalid email or password. Please try again.');
      console.error('Login failed', loginError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-screen auth-screen-login">
      <div className="auth-shell">
        <div className="auth-brand">
          <p className="auth-kicker">Mini Social</p>
          <h1>Welcome back.</h1>
          <p>
            Sign in to see your feed, chat with friends, and manage your social profile.
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <h2>Sign in</h2>
              <p className="auth-subtitle">Use your account email to continue.</p>
            </div>

            <label className="field-group">
              <span>Email address</span>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
              />
            </label>

            <label className="field-group">
              <span>Password</span>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </label>

            <div className="auth-row">
              <label className="remember-row">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="auth-hint" 
                style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '4px 8px', color: '#38bdf8', cursor: 'pointer' }}
                onClick={() => {
                  setEmail('admin@gmail.com');
                  setPassword('Admin123');
                }}
                title="Click to fill admin credentials"
              >
                Admin Demo: admin@gmail.com / Admin123
              </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              className="auth-link-button"
              onClick={() => navigate('/register')}
            >
              Need an account? Create one
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
