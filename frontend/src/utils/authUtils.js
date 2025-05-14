import authService from '../services/authService'; // Add this import

// Helper function to get auth header with JWT token
export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
}

// Check if user has a specific role
export function hasRole(role) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return false;

  const currentUser = authService.getCurrentUser();
  console.log('Current user role:', currentUser ? currentUser.role : 'No user');
  return currentUser && currentUser.role === `ROLE_${role}`;
}

// Check if user is authenticated
export function isAuthenticated() {
  return localStorage.getItem('user') !== null;
}