import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../../utils/authUtils';
import authService from '../../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const isAdmin = hasRole('ADMIN');
  const user = authenticated ? authService.getCurrentUser() : null;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          University Room Booking System
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/rooms">
                Rooms
              </Link>
            </li>
            {authenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/bookings">
                  My Bookings
                </Link>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/bookings/admin">
                  Manage Bookings
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            {authenticated ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">
                    Welcome, {user.username} ({isAdmin ? 'Admin' : 'User'})
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;