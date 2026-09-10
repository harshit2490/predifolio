import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiLogOut } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import '../styles/header.css';

function Header() {
  const { logout } = useAuth();

  return (
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
        <button
          className="header-btn logout-btn"
          onClick={logout}
          title="Logout"
          aria-label="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}

export default Header;
