package com.university.bookingservice.service;

import com.university.bookingservice.entity.Booking;
import com.university.bookingservice.repository.BookingRepository;
import com.university.bookingservice.dto.UserResponse;
import com.university.bookingservice.utils.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.List;


// here we make the booking-service call the room-service using eureka

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private static final String ROOM_SERVICE_NAME = "room-service"; // for eureka

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    @Qualifier("loadBalancedRestTemplate")
    private RestTemplate restTemplate; // for eureka

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private DiscoveryClient discoveryClient; // For debugging eurka

    public Booking createBooking(Booking booking, String jwtToken) {
        logger.debug("Creating booking for roomId: {}, studentId: {}", booking.getRoomId(), booking.getStudentId());

        if (booking.getStudentId() == null) {
            Long studentId = jwtUtils.extractStudentId(jwtToken);
            booking.setStudentId(studentId);
            logger.debug("Set studentId from JWT token: {}", studentId);
        }

        if (booking.getRoomId() == null || booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new IllegalArgumentException("Room ID, start time, and end time are required");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwtToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // Validate studentId by calling auth-service
        try {
            ResponseEntity<UserResponse> studentResponse = restTemplate.exchange(
                    "http://auth-service/users/" + booking.getStudentId(),
                    HttpMethod.GET,
                    entity,
                    UserResponse.class
            );
            logger.debug("Auth service response: Status={}, Body={}", studentResponse.getStatusCode(), studentResponse.getBody());
            if (studentResponse.getStatusCode() != HttpStatus.OK || studentResponse.getBody() == null) {
                throw new IllegalArgumentException("Student with ID " + booking.getStudentId() + " does not exist");
            }
        } catch (Exception e) {
            logger.error("Failed to validate studentId: {}. Error: {}", booking.getStudentId(), e.getMessage(), e);
            throw new IllegalArgumentException("Failed to validate student ID: " + e.getMessage());
        }

        // validate roomif by calling room-service using eureka
        try {
            logger.debug("Available services: {}", discoveryClient.getServices());
            discoveryClient.getInstances(ROOM_SERVICE_NAME).forEach(instance ->
                    logger.debug("Room service instance: {}:{}", instance.getHost(), instance.getPort())
            );

            String roomServiceUrl = "http://" + ROOM_SERVICE_NAME + "/rooms/" + booking.getRoomId();
            logger.debug("Attempting to validate room using service URL: {}", roomServiceUrl);

            ResponseEntity<String> roomResponse = restTemplate.exchange(
                    roomServiceUrl,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (roomResponse.getStatusCode() != HttpStatus.OK) {
                throw new IllegalArgumentException("Room with ID " + booking.getRoomId() + " does not exist");
            }
            logger.debug("Room validated successfully via service: {}", ROOM_SERVICE_NAME);

            // Check if room  is in available for booking by calling room-service
            String availabilityUrl = "http://" + ROOM_SERVICE_NAME + "/rooms/" + booking.getRoomId() + "/available";
            logger.debug("Checking room availability using service URL: {}", availabilityUrl);

            ResponseEntity<Boolean> availabilityResponse = restTemplate.exchange(
                    availabilityUrl,
                    HttpMethod.GET,
                    entity,
                    Boolean.class
            );

            if (availabilityResponse.getStatusCode() != HttpStatus.OK || !availabilityResponse.getBody()) {
                throw new IllegalArgumentException("Room with ID " + booking.getRoomId() + " is not available for booking");
            }
            logger.debug("Room availability confirmed: Room ID {} is available", booking.getRoomId());

        } catch (Exception e) {
            logger.error("Failed to validate roomId or availability: {}. Error: {}", booking.getRoomId(), e.getMessage(), e);
            throw new IllegalArgumentException("Failed to validate room ID or availability: " + e.getMessage());
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

    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> getAllBookings() {
        logger.debug("Fetching all bookings (admin only)");
        return bookingRepository.findAll();
    }
}