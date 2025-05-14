import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import roomService from '../../services/roomService';
import { hasRole } from '../../utils/authUtils';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmin = hasRole('ADMIN');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await roomService.getRoomById(id);
        setRoom(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch room details');
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomService.deleteRoom(id);
        navigate('/rooms');
      } catch (err) {
        setError('Failed to delete room');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!room) {
    return <div className="alert alert-warning">Room not found</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>{room.name}</h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <p><strong>Capacity:</strong> {room.capacity}</p>
            <p><strong>Location:</strong> {room.location}</p>
            <p><strong>Type:</strong> {room.type}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/rooms" className="btn btn-secondary me-2">Back to Rooms</Link>
          <Link to={`/bookings/create?roomId=${room.id}`} className="btn btn-success me-2">
            Book This Room
          </Link>
          {isAdmin && (
            <>
              <Link to={`/rooms/edit/${room.id}`} className="btn btn-warning me-2">
                Edit Room
              </Link>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Room
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;