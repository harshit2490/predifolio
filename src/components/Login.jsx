import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp } from 'react-icons/fi';
import '../styles/login.css';

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error);
        triggerShake();
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-grid" />

      <div className={`login-card ${shaking ? 'shake' : ''}`}>
        <div className="login-icon">
          <FiTrendingUp />
        </div>

        <h1 className="login-title">
          Stock<span className="gradient-text"> Calculator</span>
        </h1>
        <p className="login-subtitle">
          Track your investments & predict profits
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
