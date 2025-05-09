package com.university.bookingservice.repository;

import com.university.bookingservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b WHERE b.roomId = ?1 AND " +
            "((b.startTime <= ?2 AND b.endTime >= ?2) OR (b.startTime <= ?3 AND b.endTime >= ?3) OR " +
            "(b.startTime >= ?2 AND b.endTime <= ?3))")
    boolean existsByRoomIdAndOverlappingTime(Long roomId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT b FROM Booking b WHERE b.roomId = ?1 AND b.status = 'approved' AND " +
            "((b.startTime <= ?2 AND b.endTime >= ?2) OR (b.startTime <= ?3 AND b.endTime >= ?3) OR " +
            "(b.startTime >= ?2 AND b.endTime <= ?3))")
    List<Booking> findConflictingBookings(Long roomId, LocalDateTime startTime, LocalDateTime endTime);

    List<Booking> findByStudentId(Long studentId);

    List<Booking> findByStatus(String status);
}