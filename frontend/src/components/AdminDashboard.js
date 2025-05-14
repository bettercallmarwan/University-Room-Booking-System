import React, { useEffect, useState } from 'react';
import roomService from '../services/roomService';
import bookingService from '../services/bookingService';

const AdminDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newRoom, setNewRoom] = useState({
    name: '',
    location: '',
    capacity: '0',
    type: '',
    isAvailable: true,
  });
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch rooms');
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    }
    setLoading(false);
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setNewRoom({ ...newRoom, [name]: name === 'isAvailable' ? value === 'true' : value });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const roomData = {
        ...newRoom,
        capacity: parseInt(newRoom.capacity, 10) || 0,
        type: newRoom.type,
      };
      await roomService.createRoom(roomData);
      setNewRoom({ name: '', location: '', capacity: '0', type: '', isAvailable: true });
      fetchRooms();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message || 'Failed to create room';
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleEditRoom = (room) => {
    setEditingRoom({
      ...room,
      capacity: room.capacity.toString(),
      isAvailable: room.isAvailable.toString(),
    });
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const roomData = {
        ...editingRoom,
        capacity: parseInt(editingRoom.capacity, 10) || 0,
        isAvailable: editingRoom.isAvailable === 'true',
        type: editingRoom.type,
      };
      await roomService.updateRoom(editingRoom.id, roomData);
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message || 'Failed to update room';
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleDeleteRoom = async (id) => {
    setLoading(true);
    try {
      await roomService.deleteRoom(id);
      fetchRooms();
    } catch (err) {
      setError(err.message || 'Failed to delete room');
    }
    setLoading(false);
  };

  const handleApproveBooking = async (id) => {
    setLoading(true);
    try {
      await bookingService.approveBooking(id);
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to approve booking');
    }
    setLoading(false);
  };

  const handleRejectBooking = async (id) => {
    setLoading(true);
    try {
      await bookingService.rejectBooking(id);
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to reject booking');
    }
    setLoading(false);
  };

  return (
    <div className="admin-dashboard container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <section className="mb-5">
        <h3 className="mb-3">Room Management</h3>
        <form onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom} className="mb-4">
          <div className="row g-3">
            <div className="col-md-2">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editingRoom ? editingRoom.name : newRoom.name}
                onChange={editingRoom ? (e) => setEditingRoom({ ...editingRoom, name: e.target.value }) : handleRoomChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                name="location"
                placeholder="Location (e.g., Building A)"
                value={editingRoom ? editingRoom.location : newRoom.location}
                onChange={editingRoom ? (e) => setEditingRoom({ ...editingRoom, location: e.target.value }) : handleRoomChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                name="capacity"
                placeholder="Capacity"
                value={editingRoom ? editingRoom.capacity : newRoom.capacity}
                onChange={editingRoom ? (e) => setEditingRoom({ ...editingRoom, capacity: e.target.value }) : handleRoomChange}
                required
                min="1"
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <select
                name="type"
                value={editingRoom ? editingRoom.type : newRoom.type}
                onChange={editingRoom ? (e) => setEditingRoom({ ...editingRoom, type: e.target.value }) : handleRoomChange}
                required
                className="form-select"
              >
                <option value="">Select Type</option>
                <option value="Lecture">Lecture</option>
                <option value="Classroom">Classroom</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Conference">Conference</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                name="isAvailable"
                value={editingRoom ? editingRoom.isAvailable : newRoom.isAvailable}
                onChange={editingRoom ? (e) => setEditingRoom({ ...editingRoom, isAvailable: e.target.value }) : handleRoomChange}
                required
                className="form-select"
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" disabled={loading} className="btn btn-primary me-2">
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
              {editingRoom && (
                <button type="button" onClick={() => setEditingRoom(null)} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Type</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>{room.name}</td>
                  <td>{room.location}</td>
                  <td>{room.capacity}</td>
                  <td>{room.type}</td>
                  <td>{room.isAvailable ? 'Yes' : 'No'}</td>
                  <td>
                    <button onClick={() => handleEditRoom(room)} className="btn btn-warning btn-sm me-2">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h3 className="mb-3">Manage Bookings</h3>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Room</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.roomId}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{booking.startTime}</td>
                  <td>{booking.endTime}</td>
                  <td>{booking.status}</td>
                  <td>
                    <button
                      onClick={() => handleApproveBooking(booking.id)}
                      disabled={booking.status !== 'pending'}
                      className="btn btn-success btn-sm me-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectBooking(booking.id)}
                      disabled={booking.status !== 'pending'}
                      className="btn btn-danger btn-sm me-2"
                    >
                      Reject
                    </button>
                    <button className="btn btn-info btn-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;