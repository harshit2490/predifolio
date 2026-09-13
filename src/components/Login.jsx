import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FinancialBackground from './ThreeJS/FinancialBackground';
import {
  FiTrendingUp,
  FiUser,
  FiMail,
  FiLock,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiSun,
  FiMoon,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../styles/login.css';

function Login() {
  const { login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const switchMode = (signUpMode) => {
    setIsSignUp(signUpMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // Validation for Sign Up
      if (!name.trim()) {
        setError('Please enter your full name');
        triggerShake();
        return;
      }
      if (!username.trim() || username.trim().length < 3) {
        setError('Username must be at least 3 characters');
        triggerShake();
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        setError('Username can only contain letters, numbers, and underscores');
        triggerShake();
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        triggerShake();
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters');
        triggerShake();
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        triggerShake();
        return;
      }

      setLoading(true);
      try {
        const result = await signup({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        });

        if (!result.success) {
          setError(result.error);
          triggerShake();
        } else {
          toast.success(`Welcome to PrediFolio, ${name}!`);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Validation for Sign In
      if (!username.trim() || !password.trim()) {
        setError('Please enter your username/email and password');
        triggerShake();
        return;
      }

      setLoading(true);
      try {
        const result = await login(username, password);
        if (!result.success) {
          setError(result.error);
          triggerShake();
        } else {
          toast.success('Logged in successfully!');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <FinancialBackground variant="auth" theme={theme} />
      <div className="login-bg" />
      <div className="login-grid" />

      {/* Theme Toggle Button (Light/Dark mode) */}
      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label="Toggle light/dark theme"
      >
        {theme === 'dark' ? <FiSun /> : <FiMoon />}
      </button>

      <div className={`login-card ${shaking ? 'shake' : ''}`}>
        <div className="login-icon">
          <FiTrendingUp />
        </div>

        <h1 className="login-title">
          Predi<span className="gradient-text">Folio</span>
        </h1>
        <p className="login-subtitle">
          <span key={isSignUp ? 'signup-sub' : 'signin-sub'} className="fade-text">
            {isSignUp
              ? 'Create an account to start forecasting profits'
              : 'Track investments & forecast sell targets'}
          </span>
        </p>

        {/* Auth Tabs with Sliding Indicator */}
        <div className="auth-tab-switch" role="tablist" aria-label="Authentication mode">
          <div className={`auth-tab-glider ${isSignUp ? 'signup' : 'signin'}`} />
          <button
            type="button"
            role="tab"
            aria-selected={!isSignUp}
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => switchMode(false)}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignUp}
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => switchMode(true)}
          >
            Create Account
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          {/* Full Name (Sign Up only) - Smooth Collapsible */}
          <div className={`collapsible-form-field ${isSignUp ? 'expanded' : 'collapsed'}`}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                <FiUser className="form-label-icon" /> Full Name
              </label>
              <input
                id="name"
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Harshit"
                autoComplete="name"
                required={isSignUp}
                tabIndex={isSignUp ? 0 : -1}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              <FiUser className="form-label-icon" /> {isSignUp ? 'Username' : 'Username or Email'}
            </label>
            <input
              id="username"
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isSignUp ? 'Choose unique username' : 'Enter username or email'}
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          {/* Email ID (Sign Up only) - Smooth Collapsible */}
          <div className={`collapsible-form-field ${isSignUp ? 'expanded' : 'collapsed'}`}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                <FiMail className="form-label-icon" /> Email ID
              </label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required={isSignUp}
                tabIndex={isSignUp ? 0 : -1}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <FiLock className="form-label-icon" /> Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                className="form-input password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Min 6 characters' : 'Enter password'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) - Smooth Collapsible */}
          <div className={`collapsible-form-field ${isSignUp ? 'expanded' : 'collapsed'}`}>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                <FiLock className="form-label-icon" /> Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  className="form-input password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required={isSignUp}
                  tabIndex={isSignUp ? 0 : -1}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              'Processing...'
            ) : isSignUp ? (
              <span key="btn-signup" className="fade-text"><FiCheck /> Create Account</span>
            ) : (
              <span key="btn-login" className="fade-text">Log In</span>
            )}
          </button>

          <div className="auth-switch-footer">
            <span key={isSignUp ? 'footer-signup' : 'footer-login'} className="fade-text">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => switchMode(false)}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => switchMode(true)}
                  >
                    Create Account
                  </button>
                </>
              )}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
