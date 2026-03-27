package com.martin.paymentflow.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.martin.paymentflow.api.dto.AuthResponse;
import com.martin.paymentflow.api.dto.LoginRequest;
import com.martin.paymentflow.api.dto.MeResponse;
import com.martin.paymentflow.api.dto.SignupRequest;
import com.martin.paymentflow.api.dto.UpdateMeRequest;
import com.martin.paymentflow.api.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public MeResponse me(Authentication authentication) {
        return authService.getCurrentUser(authentication.getName());
    }

    @PatchMapping("/me")
    public MeResponse updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateMeRequest request
    ) {
        return authService.updateCurrentUser(authentication.getName(), request);
    }
}