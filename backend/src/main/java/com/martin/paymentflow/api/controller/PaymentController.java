package com.martin.paymentflow.api.controller;

import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.dto.PaymentResponse;
import com.martin.paymentflow.api.service.PaymentService;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.dto.UpdatePaymentStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public List<PaymentResponse> getAllPayments(
            @RequestParam(required = false) PaymentStatus status
    ) {
        return paymentService.getAllPayments(status);
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
    public List<PaymentResponse> searchPayments(@RequestParam String query) {
        return paymentService.searchPayments(query);
    }

    @GetMapping("/filter")
    public List<PaymentResponse> filterPayments(
        @RequestParam(required = false) String transactionId,
        @RequestParam(required = false) String senderName,
        @RequestParam(required = false) String recipientName,
        @RequestParam(required = false) PaymentStatus status
    ) {
        return paymentService.filterPayments(transactionId, senderName, recipientName, status);
    }  
}