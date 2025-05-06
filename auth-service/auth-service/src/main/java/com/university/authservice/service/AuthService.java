package com.university.authservice.service;

import com.university.authservice.Dto.LoginRequest;
import com.university.authservice.Dto.RegisterRequest;
import com.university.authservice.Dto.UserResponse;
import com.university.authservice.entity.Role;
import com.university.authservice.entity.User;
import com.university.authservice.repository.UserRepository;
import com.university.authservice.utilities.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public UserResponse register(RegisterRequest request) {
        logger.debug("Registering user: {}", request.getUsername());
        logger.debug("Register request role: {}", request.getRole());
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            logger.error("Username already in use: {}", request.getUsername());
            throw new RuntimeException("Username is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);
        logger.debug("User role before save: {}", user.getRole());

        User savedUser = userRepository.save(user);
        logger.debug("Saved user role: {}", savedUser.getRole());

        return new UserResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }

    public String login(LoginRequest req) {
        logger.debug("Processing login for username: {}", req.getUsername());
        Optional<User> userOpt = userRepository.findByUsername(req.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(req.getPassword(), user.getPassword())) {
                logger.debug("Password matched for user: {}", req.getUsername());
                UserDetails userDetails = org.springframework.security.core.userdetails.User
                        .withUsername(user.getUsername())
                        .password(user.getPassword())
                        .roles(user.getRole() != null ? user.getRole().name() : "USER")
                        .build();
                logger.debug("UserDetails created: {}", userDetails.getUsername());
                try {
                    String token = jwtUtil.generateToken(userDetails);
                    logger.debug("JWT token generated for user: {}", req.getUsername());
                    return token;
                } catch (Exception e) {
                    logger.error("Failed to generate JWT token: {}", e.getMessage(), e);
                    throw new RuntimeException("Failed to generate token", e);
                }
            } else {
                logger.warn("Invalid password for user: {}", req.getUsername());
            }
        } else {
            logger.warn("User not found: {}", req.getUsername());
        }
        throw new RuntimeException("Invalid username or password");
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}