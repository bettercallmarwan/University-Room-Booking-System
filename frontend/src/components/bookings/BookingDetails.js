import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { hasRole } from '../../utils/authUtils';
import bookingService from '../../services/bookingService';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmin = hasRole('ADMIN');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBookingById(id);
        setBooking(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch booking details');
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(id);
        navigate('/bookings');
      } catch (err) {
        setError('Failed to cancel booking');
      }
    }
  };

  const handleApprove = async () => {
    try {
      await bookingService.approveBooking(id);
      setBooking({ ...booking, status: 'APPROVED' });
    } catch (err) {
      setError('Failed to approve booking');
    }
  };

  const handleReject = async () => {
    try {
      await bookingService.rejectBooking(id);
      setBooking({ ...booking, status: 'REJECTED' });
    } catch (err) {
      setError('Failed to reject booking');
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!booking) {
    return <div className="alert alert-warning">Booking not found</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Booking Details</h3>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <p><strong>Room:</strong> {booking.roomName}</p>
            <p><strong>Date:</strong> {booking.date}</p>
            <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
            <p><strong>Purpose:</strong> {booking.purpose}</p>
            <p>
              <strong>Status:</strong> 
              <span className={`badge ms-2 ${
                booking.status === 'APPROVED' ? 'bg-success' :
                booking.status === 'REJECTED' ? 'bg-danger' :
                'bg-warning'
              }`}>
                {booking.status}
              </span>
            </p>
            {isAdmin && (
              <p><strong>Booked By:</strong> {booking.username}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Link to="/bookings" className="btn btn-secondary me-2">Back to Bookings</Link>
          
          {booking.status === 'PENDING' && !isAdmin && (
            <button className="btn btn-danger" onClick={handleCancel}>
              Cancel Booking
            </button>
          )}
          
          {isAdmin && booking.status === 'PENDING' && (
            <>
              <button className="btn btn-success me-2" onClick={handleApprove}>
                Approve
              </button>
              <button className="btn btn-danger" onClick={handleReject}>
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;