import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import roomService from '../../services/roomService';

const RoomForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [room, setRoom] = useState({
    name: '',
    capacity: 0,
    location: '',
    type: 'Lecture', // Default to a valid backend value
    isAvailable: true,
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      roomService.getRoomById(id)
        .then(data => {
          setRoom({
            name: data.name,
            capacity: data.capacity,
            location: data.location,
            type: data.type,
            isAvailable: data.isAvailable,
          });
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load room data');
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom(prevRoom => ({
      ...prevRoom,
      [name]: name === 'capacity' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        await roomService.updateRoom(id, room);
      } else {
        await roomService.createRoom(room);
      }
      navigate('/rooms');
    } catch (err) {
      setError(err.message || 'Failed to save room');
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-center">{id ? 'Edit Room' : 'Add New Room'}</h3>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={room.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="capacity" className="form-label">Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  id="capacity"
                  name="capacity"
                  value={room.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="location" className="form-label">Location (e.g., Building A)</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={room.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="type" className="form-label">Type</label>
                <select
                  className="form-select"
                  id="type"
                  name="type"
                  value={room.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Conference">Conference</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="isAvailable" className="form-label">Availability</label>
                <select
                  className="form-select"
                  id="isAvailable"
                  name="isAvailable"
                  value={room.isAvailable}
                  onChange={handleChange}
                  required
                >
                  <option value={true}>Available</option>
                  <option value={false}>Not Available</option>
                </select>
              </div>
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (id ? 'Update Room' : 'Create Room')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomForm;