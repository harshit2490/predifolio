import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiLogOut, FiSettings } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import ProfileModal from './ProfileModal';
import '../styles/header.css';

function Header() {
  const { currentUser, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const displayName = currentUser?.name || currentUser?.username || 'User';
  const initial = displayName[0].toUpperCase();

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">
            <FiTrendingUp />
          </div>
          <h1 className="header-title">
            Stock <span>Calculator</span>
          </h1>
        </div>

        <div className="header-actions">
          <ThemeToggle />

          {/* User Profile Pill (Shows logged-in user name & opens settings) */}
          <button
            type="button"
            className="header-user-pill"
            onClick={() => setShowProfileModal(true)}
            title="User Profile Settings"
            aria-label="User Profile Settings"
          >
            <div className="user-avatar-badge">{initial}</div>
            <div className="user-text-group">
              <span className="user-display-name">{displayName}</span>
              <span className="user-role-tag">@{currentUser?.username || 'user'}</span>
            </div>
            <FiSettings className="user-settings-icon" />
          </button>

          {/* Logout Button */}
          <button
            type="button"
            className="header-btn logout-btn"
            onClick={logout}
            title="Logout"
            aria-label="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
}

export default Header;
