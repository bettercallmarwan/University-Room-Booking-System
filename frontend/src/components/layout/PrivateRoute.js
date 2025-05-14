import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../../utils/authUtils';

const PrivateRoute = ({ children, requiredRole }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // If a specific role is required, check for that role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/rooms" />;
  }
  
  return children;
};

export default PrivateRoute;