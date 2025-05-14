import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import roomService from '../../services/roomService';
import { hasRole } from '../../utils/authUtils';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmin = hasRole('ADMIN');

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomService.deleteRoom(id);
        setRooms(rooms.filter(room => room.id !== id));
      } catch (err) {
        setError('Failed to delete room');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Available Rooms</h2>
        {isAdmin && (
          <Link to="/rooms/create" className="btn btn-primary">
            Add New Room
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {rooms.length === 0 ? (
        <div className="alert alert-info">No rooms available</div>
      ) : (
        <div className="row">
          {rooms.map(room => (
            <div key={room.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{room.name}</h5>
                  <p className="card-text">Capacity: {room.capacity}</p>
                  <p className="card-text">Location: {room.location}</p>
                  <p className="card-text">Type: {room.type}</p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <Link to={`/rooms/${room.id}`} className="btn btn-info">
                    View Details
                  </Link>
                  <Link to={`/bookings/create?roomId=${room.id}`} className="btn btn-success">
                    Book Room
                  </Link>
                  {isAdmin && (
                    <div>
                      <Link to={`/rooms/edit/${room.id}`} className="btn btn-warning me-2">
                        Edit
                      </Link>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(room.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;