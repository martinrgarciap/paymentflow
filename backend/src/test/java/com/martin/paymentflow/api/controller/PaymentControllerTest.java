package com.martin.paymentflow.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
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
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.dto.PaymentResponse;
import com.martin.paymentflow.api.dto.UpdatePaymentStatusRequest;
import com.martin.paymentflow.api.enums.CurrencyCode;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.exception.GlobalExceptionHandler;
import com.martin.paymentflow.api.exception.ResourceNotFoundException;
import com.martin.paymentflow.api.service.PaymentService;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(PaymentController.class)
@Import(GlobalExceptionHandler.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PaymentService paymentService;

    @Test
    @DisplayName("POST /api/payments should create a payment")
    void createPayment_ShouldReturnCreatedPayment() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setSenderName("John Smith");
        request.setRecipientName("Alice Wong");
        request.setAmount(new BigDecimal("1200.50"));
        request.setCurrency(CurrencyCode.CAD);
        request.setReferenceNote("Invoice payment");

        PaymentResponse response = buildPaymentResponse(
                "TXN-ABC12345",
                "John Smith",
                "Alice Wong",
                new BigDecimal("1200.50"),
                CurrencyCode.CAD,
                PaymentStatus.PENDING,
                "Invoice payment",
                false
        );

        when(paymentService.createPayment(any(CreatePaymentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionId").value("TXN-ABC12345"))
                .andExpect(jsonPath("$.senderName").value("John Smith"))
                .andExpect(jsonPath("$.recipientName").value("Alice Wong"))
                .andExpect(jsonPath("$.amount").value(1200.50))
                .andExpect(jsonPath("$.currency").value("CAD"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.riskFlag").value(false));
    }

    @Test
    @DisplayName("POST /api/payments should return 400 for invalid request")
    void createPayment_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setSenderName("");
        request.setRecipientName("Alice Wong");
        request.setAmount(new BigDecimal("0.00"));
        request.setCurrency(CurrencyCode.CAD);

        mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
        @DisplayName("GET /api/payments should return paginated payments")
        void getAllPayments_ShouldReturnPage() throws Exception {
        List<PaymentResponse> responses = List.of(
                buildPaymentResponse(
                        "TXN-001", "John Smith", "Alice Wong",
                        new BigDecimal("1200.50"), CurrencyCode.CAD,
                        PaymentStatus.PENDING, "Invoice payment", false
                ),
                buildPaymentResponse(
                        "TXN-002", "Sarah Patel", "Tom Brown",
                        new BigDecimal("7000.00"), CurrencyCode.USD,
                        PaymentStatus.PENDING, "High value transfer", true
                )
        );

        Page<PaymentResponse> page = new PageImpl<>(responses, PageRequest.of(0, 50), responses.size());

        when(paymentService.getAllPayments(isNull(), any())).thenReturn(page);

        mockMvc.perform(get("/api/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].transactionId").value("TXN-001"))
                .andExpect(jsonPath("$.content[1].transactionId").value("TXN-002"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(50));
        }

    @Test
    @DisplayName("GET /api/payments/{transactionId} should return one payment")
    void getPaymentByTransactionId_ShouldReturnPayment() throws Exception {
        PaymentResponse response = buildPaymentResponse(
                "TXN-001",
                "John Smith",
                "Alice Wong",
                new BigDecimal("1200.50"),
                CurrencyCode.CAD,
                PaymentStatus.PENDING,
                "Invoice payment",
                false
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
    @DisplayName("PATCH /api/payments/{transactionId}/status should update status")
    void updatePaymentStatus_ShouldReturnUpdatedPayment() throws Exception {
        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();
        request.setStatus(PaymentStatus.COMPLETED);

        PaymentResponse response = buildPaymentResponse(
                "TXN-001",
                "John Smith",
                "Alice Wong",
                new BigDecimal("1200.50"),
                CurrencyCode.CAD,
                PaymentStatus.COMPLETED,
                "Invoice payment",
                false
        );

        when(paymentService.updatePaymentStatus(eq("TXN-001"), any(UpdatePaymentStatusRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/payments/TXN-001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("TXN-001"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

        @Test
        @DisplayName("GET /api/payments/search should return paginated search results")
        void searchPayments_ShouldReturnPage() throws Exception {
        List<PaymentResponse> responses = List.of(
                buildPaymentResponse(
                        "TXN-SEARCH-001", "John Smith", "Alice Wong",
                        new BigDecimal("1200.50"), CurrencyCode.CAD,
                        PaymentStatus.PENDING, "Invoice payment", false
                )
        );

        Page<PaymentResponse> page = new PageImpl<>(responses, PageRequest.of(0, 50), responses.size());

        when(paymentService.searchPayments(eq("john"), isNull(), any())).thenReturn(page);

        mockMvc.perform(get("/api/payments/search").param("query", "john"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].transactionId").value("TXN-SEARCH-001"))
                .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        @DisplayName("GET /api/payments/filter should return paginated filtered results")
        void filterPayments_ShouldReturnPage() throws Exception {
        List<PaymentResponse> responses = List.of(
                buildPaymentResponse(
                        "TXN-FILTER-001", "Sarah Patel", "Tom Brown",
                        new BigDecimal("7000.00"), CurrencyCode.USD,
                        PaymentStatus.PENDING, "High value transfer", true
                )
        );

        Page<PaymentResponse> page = new PageImpl<>(responses, PageRequest.of(0, 50), responses.size());

        when(paymentService.filterPayments(
                eq(null),
                eq(null),
                eq(null),
                eq(PaymentStatus.PENDING),
                any()
        )).thenReturn(page);

        mockMvc.perform(get("/api/payments/filter").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].transactionId").value("TXN-FILTER-001"))
                .andExpect(jsonPath("$.totalElements").value(1));
        }

    private PaymentResponse buildPaymentResponse(
            String transactionId,
            String senderName,
            String recipientName,
            BigDecimal amount,
            CurrencyCode currency,
            PaymentStatus status,
            String referenceNote,
            boolean riskFlag
    ) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(transactionId);
        response.setSenderName(senderName);
        response.setRecipientName(recipientName);
        response.setAmount(amount);
        response.setCurrency(currency);
        response.setStatus(status);
        response.setReferenceNote(referenceNote);
        response.setRiskFlag(riskFlag);
        response.setCreatedAt(OffsetDateTime.now());
        response.setUpdatedAt(OffsetDateTime.now());
        return response;
    }
}