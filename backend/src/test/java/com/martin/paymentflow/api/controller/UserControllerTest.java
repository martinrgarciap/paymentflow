package com.martin.paymentflow.api.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.martin.paymentflow.api.dto.UserResponse;
import com.martin.paymentflow.api.service.UserService;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Test
    @DisplayName("GET /api/users should allow admin")
    void getUsers_ShouldAllowAdmin() throws Exception {
        List<UserResponse> users = List.of(
                new UserResponse(
                        2L,
                        "Demo",
                        "User",
                        "Demo User",
                        "demo@paymentflow.dev", new BigDecimal("2500.00"),
                        false,
                        false,
                        OffsetDateTime.now(),
                        OffsetDateTime.now()
                )
        );

        when(userService.getUsersForAdmin(eq(false))).thenReturn(users);

        mockMvc.perform(get("/api/users")
                        .with(user("admin@paymentflow.dev").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("demo@paymentflow.dev"))
                .andExpect(jsonPath("$[0].isAdmin").value(false))
                .andExpect(jsonPath("$[0].isDeactivated").value(false));
    }

    @Test
    @DisplayName("GET /api/users should reject normal user")
    void getUsers_ShouldRejectNormalUser() throws Exception {
        mockMvc.perform(get("/api/users")
                        .with(user("demo@paymentflow.dev").roles("USER")))
                .andExpect(status().isForbidden());
    }
}