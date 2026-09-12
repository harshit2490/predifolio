import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiX, FiUser, FiMail, FiLock, FiCheck, FiKey, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../styles/modal.css';

function ProfileModal({ onClose }) {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const initial = (currentUser?.name || currentUser?.username || 'U')[0].toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    if (showPasswordChange) {
      if (!currentPassword) {
        toast.error('Please enter your current password');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await updateProfile({
        name,
        email,
        currentPassword: showPasswordChange ? currentPassword : null,
        newPassword: showPasswordChange ? newPassword : null,
      });

      if (res.success) {
        toast.success('Profile updated successfully!');
        onClose();
      } else {
        toast.error(res.error || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content profile-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Profile Settings</h2>
            <p className="modal-subtitle">Manage your personal account information</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="profile-banner">
          <div className="profile-avatar-large">
            {initial}
          </div>
          <div className="profile-details">
            <h3 className="profile-name-display">{currentUser?.name || currentUser?.username}</h3>
            <span className="profile-username-badge">@{currentUser?.username || 'user'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">
              <FiUser className="form-label-icon" /> Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-username">
              <FiUser className="form-label-icon" /> Username
            </label>
            <input
              id="profile-username"
              type="text"
              className="form-input form-input-disabled"
              value={`@${currentUser?.username || ''}`}
              disabled
              title="Username cannot be changed"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">
              <FiMail className="form-label-icon" /> Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Change Password Card Section */}
          <div className="profile-security-card">
            <div className="security-card-header">
              <div className="security-card-info">
                <div className="security-icon-wrap">
                  <FiKey />
                </div>
                <div>
                  <h4 className="security-title">Password & Security</h4>
                  <p className="security-desc">
                    {showPasswordChange
                      ? 'Enter your current and new password below'
                      : 'Change your account password'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`security-toggle-btn ${showPasswordChange ? 'active' : ''}`}
                onClick={() => {
                  const next = !showPasswordChange;
                  setShowPasswordChange(next);
                  if (!next) {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }
                }}
              >
                {showPasswordChange ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordChange && (
              <div className="security-fields-wrap">
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-curr-pass">
                    <FiLock className="form-label-icon" /> Current Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="profile-curr-pass"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input password-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      title={showCurrentPassword ? 'Hide password' : 'Show password'}
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      tabIndex="-1"
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-new-pass">
                    <FiLock className="form-label-icon" /> New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="profile-new-pass"
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input password-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      tabIndex="-1"
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-confirm-pass">
                    <FiLock className="form-label-icon" /> Confirm Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="profile-confirm-pass"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input password-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
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
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="profile-modal-actions">
            <button
              type="button"
              className="profile-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="profile-btn-save"
              disabled={loading}
            >
              {loading ? (
                'Saving changes...'
              ) : (
                <>
                  <FiCheck /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
