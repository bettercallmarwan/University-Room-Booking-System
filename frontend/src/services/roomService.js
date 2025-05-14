import axios from 'axios';
import authHeader from '../utils/authUtils';

// Update this line to match your room-service port
const API_URL = 'http://localhost:8082/api/rooms'; // Adjust port as needed

// Get all rooms
const getAllRooms = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch rooms' };
  }
};

// Get room by ID
const getRoomById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch room' };
  }
};

// Create a new room (admin only)
const createRoom = async (roomData) => {
  try {
    const response = await axios.post(API_URL, roomData, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create room' };
  }
};

// Update a room (admin only)
const updateRoom = async (id, roomData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, roomData, { headers: authHeader() });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update room' };
  }
};

// Delete a room (admin only)
const deleteRoom = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
    return true;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete room' };
  }
};

const roomService = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};

export default roomService;