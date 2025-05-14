import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { hasRole } from '../../utils/authUtils';
import bookingService from '../../services/bookingService';
import authService from '../../services/authService';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const isAdmin = hasRole('ADMIN');
  const isAdminView = isAdmin && location.search.includes('admin=true');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        let data;
        if (isAdminView) {
          data = await bookingService.getAllBookings();
        } else {
          // Get current user from auth service
          const currentUser = authService.getCurrentUser();
          if (!currentUser || !currentUser.studentId) {
            throw new Error('User not found or missing studentId');
          }
          // Use viewBookingHistory with the current user's studentId
          data = await bookingService.viewBookingHistory(currentUser.studentId);
        }
        setBookings(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAdminView]);

  const handleApprove = async (id) => {
    try {
      await bookingService.approveBooking(id);
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: 'APPROVED' } : booking
      ));
    } catch (err) {
      setError('Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
    try {
      await bookingService.rejectBooking(id);
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: 'REJECTED' } : booking
      ));
    } catch (err) {
      setError('Failed to reject booking');
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isAdminView ? 'All Bookings' : 'My Bookings'}</h2>
        <Link to="/bookings/create" className="btn btn-primary">
          New Booking
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {bookings.length === 0 ? (
        <div className="alert alert-info">No bookings found</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
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
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.roomId}</td> {/* Update to display roomName if available */}
                  <td>{new Date(booking.startTime).toLocaleDateString()}</td>
                  <td>{new Date(booking.startTime).toLocaleTimeString()}</td>
                  <td>{new Date(booking.endTime).toLocaleTimeString()}</td>
                  <td>
                    <span className={`badge ${
                      booking.status === 'approved' ? 'bg-success' :
                      booking.status === 'canceled' ? 'bg-danger' :
                      'bg-warning'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/bookings/${booking.id}`} className="btn btn-sm btn-info me-2">
                      View
                    </Link>
                    {isAdminView && booking.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success me-2" 
                          onClick={() => handleApprove(booking.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleReject(booking.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingList;