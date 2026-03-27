package com.martin.paymentflow.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.dto.PaymentResponse;
import com.martin.paymentflow.api.dto.UpdatePaymentStatusRequest;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.exception.ResourceNotFoundException;
import com.martin.paymentflow.api.service.PaymentService;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private PaymentService paymentService;

    @Test
    @DisplayName("POST /api/payments should create a payment for authenticated user")
    void createPayment_ShouldReturnCreatedPayment() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setRecipientId(2L);
        request.setAmount(new BigDecimal("1200.50"));
        request.setReferenceNote("Invoice payment");

        PaymentResponse response = buildPaymentResponse(
                "TXN-ABC12345",
                "Martin Garcia",
                "Alice Wong",
                new BigDecimal("1200.50"),
                PaymentStatus.PENDING,
                "Invoice payment",
                true,
                null
        );

        when(paymentService.createPayment(any(CreatePaymentRequest.class), eq("martin@example.com")))
                .thenReturn(response);

        mockMvc.perform(post("/api/payments")
                        .with(user("martin@example.com").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionId").value("TXN-ABC12345"))
                .andExpect(jsonPath("$.senderName").value("Martin Garcia"))
                .andExpect(jsonPath("$.recipientName").value("Alice Wong"))
                .andExpect(jsonPath("$.amount").value(1200.50))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.riskFlag").value(true));
    }

    @Test
    @DisplayName("POST /api/payments should return 400 for invalid request")
    void createPayment_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setAmount(new BigDecimal("0.00"));

        mockMvc.perform(post("/api/payments")
                        .with(user("martin@example.com").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("GET /api/payments should return paginated payments")
    void getAllPayments_ShouldReturnPage() throws Exception {
        List<PaymentResponse> responses = List.of(
                buildPaymentResponse(
                        "TXN-001", "John Smith", "Alice Wong",
                        new BigDecimal("1200.50"), PaymentStatus.PENDING,
                        "Invoice payment", false, null
                ),
                buildPaymentResponse(
                        "TXN-002", "Sarah Patel", "Tom Brown",
                        new BigDecimal("7000.00"), PaymentStatus.PENDING,
                        "High value transfer", true, null
                )
        );

        Page<PaymentResponse> page = new PageImpl<>(responses, PageRequest.of(0, 50), responses.size());

        when(paymentService.getAllPayments(isNull(), isNull(), any())).thenReturn(page);

        mockMvc.perform(get("/api/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].transactionId").value("TXN-001"))
                .andExpect(jsonPath("$.content[1].transactionId").value("TXN-002"));
    }

    @Test
    @DisplayName("GET /api/payments/{transactionId} should return one payment")
    void getPaymentByTransactionId_ShouldReturnPayment() throws Exception {
        PaymentResponse response = buildPaymentResponse(
                "TXN-001",
                "John Smith",
                "Alice Wong",
                new BigDecimal("1200.50"),
                PaymentStatus.PENDING,
                "Invoice payment",
                false,
                null
        );

        when(paymentService.getPaymentByTransactionId("TXN-001")).thenReturn(response);

        mockMvc.perform(get("/api/payments/TXN-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("TXN-001"))
                .andExpect(jsonPath("$.senderName").value("John Smith"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("GET /api/payments/{transactionId} should return 404 when missing")
    void getPaymentByTransactionId_ShouldReturnNotFound() throws Exception {
        when(paymentService.getPaymentByTransactionId("TXN-MISSING"))
                .thenThrow(new ResourceNotFoundException("Payment not found: TXN-MISSING"));

        mockMvc.perform(get("/api/payments/TXN-MISSING"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Payment not found: TXN-MISSING"));
    }

    @Test
    @DisplayName("PATCH /api/payments/{transactionId}/status should allow admin")
    void updatePaymentStatus_ShouldReturnUpdatedPayment_ForAdmin() throws Exception {
        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();
        request.setStatus(PaymentStatus.COMPLETED);

        PaymentResponse response = buildPaymentResponse(
                "TXN-001",
                "John Smith",
                "Alice Wong",
                new BigDecimal("1200.50"),
                PaymentStatus.COMPLETED,
                "Invoice payment",
                false,
                null
        );

        when(paymentService.updatePaymentStatus(eq("TXN-001"), any(UpdatePaymentStatusRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/payments/TXN-001/status")
                        .with(user("admin@example.com").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("TXN-001"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("PATCH /api/payments/{transactionId}/status should reject non-admin")
    void updatePaymentStatus_ShouldReturnForbidden_ForNonAdmin() throws Exception {
        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();
        request.setStatus(PaymentStatus.COMPLETED);

        mockMvc.perform(patch("/api/payments/TXN-001/status")
                        .with(user("martin@example.com").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/payments/me should return current user payments")
    void getMyPayments_ShouldReturnPage() throws Exception {
        List<PaymentResponse> responses = List.of(
                buildPaymentResponse(
                        "TXN-ME-001",
                        "Martin Garcia",
                        "Alice Wong",
                        new BigDecimal("50.00"),
                        PaymentStatus.COMPLETED,
                        "Lunch",
                        false,
                        null
                )
        );

        Page<PaymentResponse> page = new PageImpl<>(responses, PageRequest.of(0, 50), responses.size());

        when(paymentService.getMyPayments(eq("martin@example.com"), eq("all"), any())).thenReturn(page);

        mockMvc.perform(get("/api/payments/me")
                        .with(user("martin@example.com").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].transactionId").value("TXN-ME-001"));
    }

    private PaymentResponse buildPaymentResponse(
            String transactionId,
            String senderName,
            String recipientName,
            BigDecimal amount,
            PaymentStatus status,
            String referenceNote,
            boolean riskFlag,
            String failureReason
    ) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transactionId);
        response.setSenderName(senderName);
        response.setRecipientName(recipientName);
        response.setAmount(amount);
        response.setStatus(status);
        response.setReferenceNote(referenceNote);
        response.setRiskFlag(riskFlag);
        response.setFailureReason(failureReason);
        response.setCreatedAt(OffsetDateTime.now());
        response.setUpdatedAt(OffsetDateTime.now());
        return response;
    }
}