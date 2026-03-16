package com.martin.paymentflow.api.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.dto.PaymentResponse;
import com.martin.paymentflow.api.dto.UpdatePaymentStatusRequest;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.createPayment(request);
    }

    @GetMapping
    public Page<PaymentResponse> getAllPayments(
            @RequestParam(required = false) PaymentStatus status,
            @PageableDefault(size = 100, sort = "updatedAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return paymentService.getAllPayments(status, pageable);
    }

    @GetMapping("/{transactionId}")
    public PaymentResponse getPaymentByTransactionId(@PathVariable String transactionId) {
        return paymentService.getPaymentByTransactionId(transactionId);
    }

    @PatchMapping("/{transactionId}/status")
    public PaymentResponse updatePaymentStatus(
        @PathVariable String transactionId,
        @Valid @RequestBody UpdatePaymentStatusRequest request
    ) {
        return paymentService.updatePaymentStatus(transactionId, request);
    }

    @GetMapping("/search")
    public Page<PaymentResponse> searchPayments(
        @RequestParam String query,
        @RequestParam(required = false) PaymentStatus status,
        @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable
    ) {
        return paymentService.searchPayments(query, status, pageable);
    }

    @GetMapping("/filter")
    public Page<PaymentResponse> filterPayments(
        @RequestParam(required = false) String transactionId,
        @RequestParam(required = false) String senderName,
        @RequestParam(required = false) String recipientName,
        @RequestParam(required = false) PaymentStatus status,
        @PageableDefault(size = 100, sort = "updatedAt", direction = Sort.Direction.DESC)
        Pageable pageable
    ) {
        return paymentService.filterPayments(transactionId, senderName, recipientName, status, pageable);
    }
}