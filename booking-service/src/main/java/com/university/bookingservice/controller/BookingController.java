package com.university.bookingservice.controller;

import com.university.bookingservice.entity.Booking;
import com.university.bookingservice.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking,
                                           @RequestHeader("Authorization") String authHeader) {
        logger.debug("Received create booking request: {}", booking);
        try {
            String jwtToken = authHeader != null && authHeader.startsWith("Bearer ")
                    ? authHeader.substring(7)
                    : null;
            if (jwtToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("JWT token is required");
            }
            Booking savedBooking = bookingService.createBooking(booking, jwtToken);
            return ResponseEntity.ok(savedBooking);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable("id") Long id) {
        try {
            Booking approvedBooking = bookingService.approveBooking(id);
            return ResponseEntity.ok(approvedBooking);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to approve booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable("id") Long id) {
        try {
            Booking rejectedBooking = bookingService.rejectBooking(id);
            return ResponseEntity.ok(rejectedBooking);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to reject booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }



    //PUT: /api/bookings/{id}/cancel?studentId={studentId}   // only for approved bookings
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @RequestParam Long studentId) {
        try {
            Booking canceledBooking = bookingService.cancelBooking(id, studentId);
            return ResponseEntity.ok(canceledBooking);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to cancel booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }



    // GET: http://localhost:8082/api/bookings/history?studentId=10019
    @GetMapping("/history")
    public ResponseEntity<?> viewBookingHistory(@RequestParam("studentId") Long studentId) {
        try {
            List<Booking> history = bookingService.viewBookingHistory(studentId);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to fetch booking history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error while fetching booking history for studentId {}: {}", studentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping("/availability")
    public ResponseEntity<?> viewRoomAvailability(@RequestParam Long roomId,
                                                  @RequestParam LocalDateTime startTime,
                                                  @RequestParam LocalDateTime endTime) {
        try {
            List<Booking> conflictingBookings = bookingService.viewRoomAvailability(roomId, startTime, endTime);
            return ResponseEntity.ok(conflictingBookings);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to check room availability: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    @GetMapping("/admin")
    public ResponseEntity<?> getAllBookings() {
        try {
            List<Booking> allBookings = bookingService.getAllBookings();
            return ResponseEntity.ok(allBookings);
        } catch (Exception e) {
            logger.error("Failed to fetch all bookings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch all bookings: " + e.getMessage());
        }
    }
}