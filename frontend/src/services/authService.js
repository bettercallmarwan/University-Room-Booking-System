import axios from 'axios';

// Update this line to match your auth-service port
const API_URL = 'http://localhost:8082/api/auth';

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

// Register a new user
const register = async (username, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      password,
      role
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login user
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Extract token
    const token = typeof response.data === 'string' ? response.data : response.data.token;
    if (!token) {
      throw new Error('Invalid login response: No token found');
    }

    // Decode token to verify payload
    const payload = decodeToken(token);
    if (!payload) {
      throw new Error('Failed to decode token');
    }

    console.log('Decoded payload during login:', payload); // Debug payload
    if (!payload.studentId) {
      console.warn('No studentId in token payload:', payload);
    }
    if (!payload.role) {
      console.warn('No role in token payload:', payload);
    }

    const user = { token };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user with decoded token payload
const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) return null;

  const payload = decodeToken(user.token);
  if (!payload) return null;

  return {
    token: user.token,
    username: payload.sub || null,
    studentId: payload.studentId || null,
    role: payload.role || null
  };
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser
};



export default authService;