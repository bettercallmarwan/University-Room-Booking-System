import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import roomService from '../../services/roomService';
import bookingService from '../../services/bookingService';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('roomId');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState({
    roomId: roomId || '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomService.getAllRooms();
        setRooms(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch rooms');
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBooking(prevBooking => ({
      ...prevBooking,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Combine start date/time and end date/time into ISO strings
    const startDateTime = new Date(`${booking.startDate}T${booking.startTime}`);
    const endDateTime = new Date(`${booking.endDate}T${booking.endTime}`);

    const bookingPayload = {
      roomId: booking.roomId,
      startTime: startDateTime.toISOString().slice(0, 19),
      endTime: endDateTime.toISOString().slice(0, 19)
    };

    try {
      await bookingService.createBooking(bookingPayload);
      navigate('/bookings');
    } catch (err) {
      setError(err.message || 'Sorry, Room is unavailable');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-center">Book a Room</h3>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="roomId" className="form-label">Room</label>
                <select
                  className="form-select"
                  id="roomId"
                  name="roomId"
                  value={booking.roomId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.building} (Capacity: {room.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  value={booking.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="startTime" className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  id="startTime"
                  name="startTime"
                  value={booking.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="endDate"
                  name="endDate"
                  value={booking.endDate}
                  onChange={handleChange}
                  min={booking.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="endTime" className="form-label">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  id="endTime"
                  name="endTime"
                  value={booking.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Book Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;