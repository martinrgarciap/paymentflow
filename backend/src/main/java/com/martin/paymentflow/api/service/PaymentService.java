package com.martin.paymentflow.api.service;

import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasRecipientName;
import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasSenderName;
import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasStatus;
import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasTransactionId;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.dto.PaymentResponse;
import com.martin.paymentflow.api.dto.UpdatePaymentStatusRequest;
import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.exception.ResourceNotFoundException;
import com.martin.paymentflow.api.repository.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Payment payment = new Payment();

        payment.setTransactionId(generateTransactionId());
        payment.setSenderName(request.getSenderName());
        payment.setRecipientName(request.getRecipientName());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setReferenceNote(request.getReferenceNote());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setRiskFlag(request.getAmount().doubleValue() > 5000);
        payment.setCreatedAt(OffsetDateTime.now());
        payment.setUpdatedAt(OffsetDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(payment.getTransactionId());
        response.setSenderName(payment.getSenderName());
        response.setRecipientName(payment.getRecipientName());
        response.setAmount(payment.getAmount());
        response.setCurrency(payment.getCurrency());
        response.setStatus(payment.getStatus());
        response.setReferenceNote(payment.getReferenceNote());
        response.setRiskFlag(payment.isRiskFlag());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Page<PaymentResponse> getAllPayments(PaymentStatus status, Pageable pageable) {
    Page<Payment> payments = (status == null)
            ? paymentRepository.findAll(pageable)
            : paymentRepository.findByStatus(status, pageable);

    return payments.map(this::mapToResponse);
    }

    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + transactionId));
        return mapToResponse(payment);
    }

    public PaymentResponse updatePaymentStatus(String transactionId, UpdatePaymentStatusRequest request) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + transactionId));
        payment.setStatus(request.getStatus());
        payment.setUpdatedAt(OffsetDateTime.now());

        Payment updatedPayment = paymentRepository.save(payment);

        return mapToResponse(updatedPayment);
    }

    public Page<PaymentResponse> searchPayments(String query, Pageable pageable) {
        String trimmedQuery = query.trim();

        Page<Payment> payments = paymentRepository
            .findByTransactionIdContainingIgnoreCaseOrSenderNameContainingIgnoreCaseOrRecipientNameContainingIgnoreCase(
                trimmedQuery, 
                trimmedQuery, 
                trimmedQuery,
                pageable
            );

        return payments.map(this::mapToResponse);
    }

    public Page<PaymentResponse> filterPayments(String transactionId, String senderName,
                                    String recipientName, PaymentStatus status, Pageable pageable) {
        Specification<Payment> spec = Specification
            .where(hasTransactionId(transactionId))
            .and(hasSenderName(senderName))
            .and(hasRecipientName(recipientName))
            .and(hasStatus(status));

        Page<Payment> payments = paymentRepository.findAll(spec, pageable);

        return payments.map(this::mapToResponse);
    }
}