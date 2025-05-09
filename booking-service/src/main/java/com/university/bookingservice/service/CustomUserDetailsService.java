package com.university.bookingservice.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // In a real system, call auth-service API to fetch user details
        return User.withUsername(username)
                .password("") // Password not needed for JWT
                .roles("USER") // Default role; overridden by JwtAuthenticationFilter
                .build();
    }
}