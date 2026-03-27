package com.martin.paymentflow.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.martin.paymentflow.api.dto.LoginRequest;
import com.martin.paymentflow.api.entity.User;
import com.martin.paymentflow.api.exception.AuthenticationException;
import com.martin.paymentflow.api.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User deactivatedUser;

    @BeforeEach
    void setUp() {
        deactivatedUser = new User();
        ReflectionTestUtils.setField(deactivatedUser, "id", 1L);
        deactivatedUser.setFirstName("Disabled");
        deactivatedUser.setLastName("User");
        deactivatedUser.setEmail("disabled@paymentflow.dev");
        deactivatedUser.setPasswordHash("hashed");
        deactivatedUser.setBalance(new BigDecimal("100.00"));
        deactivatedUser.setAdmin(false);
        deactivatedUser.setDeactivated(true);
    }

    @Test
    @DisplayName("login should fail for deactivated user")
    void login_ShouldFail_ForDeactivatedUser() {
        LoginRequest request = new LoginRequest();
        request.setEmail("disabled@paymentflow.dev");
        request.setPassword("password123");

        when(userRepository.findByEmailIgnoreCase("disabled@paymentflow.dev"))
                .thenReturn(Optional.of(deactivatedUser));

        AuthenticationException ex = assertThrows(
                AuthenticationException.class,
                () -> authService.login(request)
        );

        assertEquals("This account has been deactivated.", ex.getMessage());
    }
}