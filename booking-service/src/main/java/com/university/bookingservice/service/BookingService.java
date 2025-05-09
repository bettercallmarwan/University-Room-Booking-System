package com.university.bookingservice.service;

import com.university.bookingservice.entity.Booking;
import com.university.bookingservice.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(Booking booking) {
        logger.debug("Creating booking for roomId: {}, studentId: {}", booking.getRoomId(), booking.getStudentId());
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (booking.getStartTime().isAfter(booking.getEndTime())) {
            throw new IllegalArgumentException("Start time cannot be after end time");
        }
        if (booking.getRoomId() == null || booking.getStudentId() == null) {
            throw new IllegalArgumentException("Room ID and student ID are required");
        }
        if (!bookingRepository.existsByRoomIdAndOverlappingTime(booking.getRoomId(), booking.getStartTime(), booking.getEndTime())) {
            booking.setStatus("pending");
            return bookingRepository.save(booking);
        } else {
            throw new IllegalArgumentException("Room is not available for the selected time slot");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Booking approveBooking(Long bookingId) {
        logger.debug("Approving booking with id: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if ("pending".equals(booking.getStatus())) {
            booking.setStatus("approved");
            return bookingRepository.save(booking);
        }
        throw new IllegalArgumentException("Booking is not in pending status");
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Booking rejectBooking(Long bookingId) {
        logger.debug("Rejecting booking with id: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if ("pending".equals(booking.getStatus())) {
            booking.setStatus("canceled");
            return bookingRepository.save(booking);
        }
        throw new IllegalArgumentException("Booking is not in pending status");
    }

    public Booking cancelBooking(Long bookingId, Long studentId) {
        logger.debug("Canceling booking with id: {} by studentId: {}", bookingId, studentId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getStudentId().equals(studentId) && "approved".equals(booking.getStatus())) {
            booking.setStatus("canceled");
            return bookingRepository.save(booking);
        }
        throw new IllegalArgumentException("Only the student who booked can cancel an approved booking");
    }

    public List<Booking> viewBookingHistory(Long studentId) {
        logger.debug("Fetching booking history for studentId: {}", studentId);
        return bookingRepository.findByStudentId(studentId);
    }

    public List<Booking> viewRoomAvailability(Long roomId, LocalDateTime startTime, LocalDateTime endTime) {
        logger.debug("Checking availability for roomId: {} between {} and {}", roomId, startTime, endTime);
        if (startTime == null || endTime == null || startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("Invalid time range");
        }
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(roomId, startTime, endTime);
        return conflictingBookings.isEmpty() ? List.of() : conflictingBookings;
    }
}