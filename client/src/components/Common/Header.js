import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Image Manager</h1>
        {user && (
          <div className="user-section">
            <span className="welcome">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;