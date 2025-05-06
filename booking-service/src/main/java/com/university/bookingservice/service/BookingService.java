package com.university.bookingservice.service;

import com.university.bookingservice.entity.Booking;
import com.university.bookingservice.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class BookingService
{
    @Autowired
    private BookingRepository bookingRepository;

    public Booking CreateBooking(Booking booking){
        if(booking.getStartTime().isAfter(booking.getEndTime())){
            throw new IllegalArgumentException("Start time cannot be after end time");
        }


    }
}
