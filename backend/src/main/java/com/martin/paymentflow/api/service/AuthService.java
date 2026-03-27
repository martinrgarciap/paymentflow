package com.martin.paymentflow.api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.martin.paymentflow.api.dto.AuthResponse;
import com.martin.paymentflow.api.dto.LoginRequest;
import com.martin.paymentflow.api.dto.MeResponse;
import com.martin.paymentflow.api.dto.SignupRequest;
import com.martin.paymentflow.api.dto.UpdateMeRequest;
import com.martin.paymentflow.api.entity.User;
import com.martin.paymentflow.api.exception.AuthenticationException;
import com.martin.paymentflow.api.exception.ResourceNotFoundException;
import com.martin.paymentflow.api.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(SignupRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with that email already exists.");
        }

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setAdmin(false);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        AuthResponse response = new AuthResponse();
        response.setId(savedUser.getId());
        response.setFullName(savedUser.getFullName());
        response.setEmail(savedUser.getEmail());
        response.setBalance(savedUser.getBalance());
        response.setAdmin(savedUser.isAdmin());
        response.setMessage("Signup successful.");
        response.setToken(token);
        response.setDeactivated(savedUser.isDeactivated());

        return response;
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new AuthenticationException("Invalid email or password."));

        if (user.isDeactivated()) {
            throw new AuthenticationException("This account has been deactivated.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user);

        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setBalance(user.getBalance());
        response.setAdmin(user.isAdmin());
        response.setMessage("Login successful.");
        response.setToken(token);
        response.setDeactivated(user.isDeactivated());

        return response;
    }

    public MeResponse getCurrentUser(String authenticatedEmail) {
        User user = userRepository.findByEmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + authenticatedEmail));

        return new MeResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getBalance(),
                user.isAdmin(),
                user.isDeactivated()
        );
    }

    public MeResponse updateCurrentUser(String authenticatedEmail, UpdateMeRequest request) {
        User user = userRepository.findByEmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + authenticatedEmail));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());

        User savedUser = userRepository.save(user);

        return new MeResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getBalance(),
                savedUser.isAdmin(),
                savedUser.isDeactivated()
        );
    }
}