package com.university.bookingservice.repository;

import com.university.bookingservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    boolean existsByName(String name);
}
