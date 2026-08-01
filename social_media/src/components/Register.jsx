import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({ email, password });
      navigate('/login');
    } catch (registerError) {
      console.error('Error registering user:', registerError);
      setError('Error registering user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-screen auth-screen-register">
      <div className="auth-shell">
        <div className="auth-brand">
          <p className="auth-kicker">Join the network</p>
          <h1>Create your account.</h1>
          <p>
            Register once and start sharing posts, connecting with friends, and managing your profile.
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <h2>Create account</h2>
              <p className="auth-subtitle">Use a valid email and a strong password.</p>
            </div>

            <label className="field-group">
              <span>Email address</span>
              <input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="field-group">
              <span>Password</span>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            <label className="field-group">
              <span>Confirm password</span>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

            <button type="button" className="auth-link-button" onClick={() => navigate('/login')}>
              Already have an account? Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
