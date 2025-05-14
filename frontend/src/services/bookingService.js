import axios from 'axios';
import authHeader from '../utils/authUtils';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8082/api/bookings'; // Corrected port to 8082

// Get all bookings (admin only)
const getAllBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error.response?.data || { message: 'Failed to fetch bookings' };
  }
};

// Get bookings for current user
const getUserBookings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log('User from localStorage:', user); // Log user object

      if (!user || !user.token) {
        throw new Error('User not found or missing token');
      }

      const token = user.token;
      console.log('Token:', token); // Log token

      let studentId;
      try {
        const payload = jwtDecode(token);
        console.log('JWT Payload:', payload); // Log payload
        
        // Extract studentId directly from the payload
        // The token contains studentId as shown in the Authorization header
        studentId = payload.studentId;
        console.log('Direct studentId from payload:', studentId);
        
        // If studentId is undefined or null, try fallback options
        if (studentId === undefined || studentId === null) {
          // Fallback options if studentId is not directly available
          studentId = payload.studentId || payload.id || payload.userId || payload.sub;
          // Ensure studentId is a valid string
          studentId = studentId !== undefined && studentId !== null ? String(studentId) : undefined;
          console.log('Student ID (converted to string):', studentId);
        }
        
        if (studentId === undefined || studentId === null) {
          console.error('Student ID not found in token. Available keys:', Object.keys(payload).join(', '));
          throw new Error('Student ID not found in token payload');
        }
        
        console.log('Successfully extracted studentId:', studentId);
      } catch (error) {
        console.error('Token parsing error:', error);
        throw new Error(`Failed to parse JWT token: ${error.message}`);
      }

      // Convert to string and ensure it's not undefined before making the request
      // Make sure studentId is properly converted to string, even if it's a number in the JWT
      studentId = studentId !== undefined && studentId !== null ? String(studentId) : undefined;
      console.log('Student ID (converted to string):', studentId);
      
      // If studentId is still undefined after all attempts, throw an error
      if (studentId === undefined || studentId === null) {
        throw new Error('Failed to extract valid studentId from token');
      }
      
      const response = await axios.get(`${API_URL}/history?studentId=${studentId}`, {
        headers: authHeader(),
      });
      console.log('Bookings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      throw error.response?.data || { message: `Failed to fetch bookings: ${error.message}` };
    }
  };

// Get booking by ID
const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking' };
  }
};

// Create a new booking
const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(API_URL, bookingData, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create booking' };
  }
};

// Cancel a booking
const cancelBooking = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel booking' };
  }
};

// Approve a booking (admin only)
const approveBooking = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/approve`, {}, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to approve booking' };
  }
};

// Reject a booking (admin only)
const rejectBooking = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/reject`, {}, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reject booking' };
  }
};

// View booking history for a student
const viewBookingHistory = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/history?studentId=${studentId}`, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking history' };
  }
};

const bookingService = {
  getAllBookings,
  getUserBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  viewBookingHistory
};

export default bookingService;