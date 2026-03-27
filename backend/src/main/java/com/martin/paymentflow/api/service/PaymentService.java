package com.martin.paymentflow.api.service;

import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasRecipientName;
import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasRiskFlag;
import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasSenderName;
import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasStatus;
import static com.martin.paymentflow.api.repository.PaymentSpecifications.hasTransactionId;
import static com.martin.paymentflow.api.repository.PaymentSpecifications.matchesSearchQuery;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.dto.PaymentResponse;
import com.martin.paymentflow.api.dto.UpdatePaymentStatusRequest;
import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.entity.User;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.exception.ResourceNotFoundException;
import com.martin.paymentflow.api.repository.PaymentRepository;
import com.martin.paymentflow.api.repository.UserRepository;

@Service
public class PaymentService {

    private static final BigDecimal APPROVAL_THRESHOLD = new BigDecimal("5000.00");

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request, String authenticatedEmail) {
        User sender = userRepository.findByEmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + authenticatedEmail));

        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found: " + request.getRecipientId()));

        if (sender.isDeactivated()) {
            throw new IllegalStateException("Deactivated users cannot send payments.");
        }

        if (recipient.isDeactivated()) {
            throw new IllegalArgumentException("Cannot send payments to a deactivated user.");
        }

        if (sender.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Sender and recipient must be different users.");
        }

        Payment payment = new Payment();
        OffsetDateTime now = OffsetDateTime.now();

        payment.setTransactionId(generateTransactionId());

        payment.setSender(sender);
        payment.setRecipient(recipient);

        payment.setSenderName(sender.getFullName());
        payment.setRecipientName(recipient.getFullName());

        payment.setAmount(request.getAmount());
        payment.setReferenceNote(request.getReferenceNote());
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);

        boolean requiresApproval = requiresApproval(request.getAmount());
        payment.setRiskFlag(requiresApproval);

        if (requiresApproval) {
            payment.setStatus(PaymentStatus.PENDING);
            payment.setFailureReason(null);
        } else {
            processImmediatePayment(payment, sender, recipient);
        }

        Payment savedPayment = paymentRepository.save(payment);
        return mapToResponse(savedPayment);
    }

    private void processImmediatePayment(Payment payment, User sender, User recipient) {
        BigDecimal amount = payment.getAmount();

        if (!sender.isAdmin() && sender.getBalance().compareTo(amount) < 0) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Insufficient funds.");
            return;
        }

        if (!sender.isAdmin()) {
            sender.setBalance(sender.getBalance().subtract(amount));
        }

        recipient.setBalance(recipient.getBalance().add(amount));

        userRepository.save(sender);
        userRepository.save(recipient);

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setFailureReason(null);
    }

    private boolean requiresApproval(BigDecimal amount) {
        return amount.compareTo(APPROVAL_THRESHOLD) > 0;
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(payment.getTransactionId());
        response.setSenderName(resolveSenderName(payment));
        response.setRecipientName(resolveRecipientName(payment));
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus());
        response.setReferenceNote(payment.getReferenceNote());
        response.setRiskFlag(payment.isRiskFlag());
        response.setFailureReason(payment.getFailureReason());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }

    private String resolveSenderName(Payment payment) {
        if (payment.getSender() != null) {
            return payment.getSender().getFullName();
        }
        return payment.getSenderName();
    }

    private String resolveRecipientName(Payment payment) {
        if (payment.getRecipient() != null) {
            return payment.getRecipient().getFullName();
        }
        return payment.getRecipientName();
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Page<PaymentResponse> getAllPayments(PaymentStatus status, Boolean riskFlag, Pageable pageable) {
        Specification<Payment> spec = Specification
                .where(hasStatus(status))
                .and(hasRiskFlag(riskFlag));

        Page<Payment> payments = paymentRepository.findAll(spec, pageable);
        return payments.map(this::mapToResponse);
    }

    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + transactionId));
        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse updatePaymentStatus(String transactionId, UpdatePaymentStatusRequest request) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + transactionId));

        PaymentStatus currentStatus = payment.getStatus();
        PaymentStatus requestedStatus = request.getStatus();

        if (currentStatus != PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Only pending payments can be updated.");
        }

        if (requestedStatus != PaymentStatus.COMPLETED && requestedStatus != PaymentStatus.FAILED) {
            throw new IllegalArgumentException("Pending payments can only be marked COMPLETED or FAILED.");
        }

        if (requestedStatus == PaymentStatus.COMPLETED) {
            User sender = payment.getSender();
            User recipient = payment.getRecipient();

            if (sender == null || recipient == null) {
                throw new IllegalStateException("Pending payment is missing sender or recipient.");
            }

            if (!sender.isAdmin() && sender.getBalance().compareTo(payment.getAmount()) < 0) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Insufficient funds at approval time.");
            } else {
                if (!sender.isAdmin()) {
                    sender.setBalance(sender.getBalance().subtract(payment.getAmount()));
                }

                recipient.setBalance(recipient.getBalance().add(payment.getAmount()));

                userRepository.save(sender);
                userRepository.save(recipient);

                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setFailureReason(null);
            }
        }

        if (requestedStatus == PaymentStatus.FAILED) {
            payment.setStatus(PaymentStatus.FAILED);
            if (payment.getFailureReason() == null || payment.getFailureReason().isBlank()) {
                payment.setFailureReason("Rejected by admin.");
            }
        }

        payment.setUpdatedAt(OffsetDateTime.now());

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToResponse(updatedPayment);
    }

    public Page<PaymentResponse> searchPayments(String query, PaymentStatus status, Boolean riskFlag, Pageable pageable) {
        Specification<Payment> spec = Specification
                .where(matchesSearchQuery(query))
                .and(hasStatus(status))
                .and(hasRiskFlag(riskFlag));

        Page<Payment> payments = paymentRepository.findAll(spec, pageable);
        return payments.map(this::mapToResponse);
    }

    public Page<PaymentResponse> filterPayments(
            String transactionId,
            String senderName,
            String recipientName,
            PaymentStatus status,
            Boolean riskFlag,
            Pageable pageable
    ) {
        Specification<Payment> spec = Specification
                .where(hasTransactionId(transactionId))
                .and(hasSenderName(senderName))
                .and(hasRecipientName(recipientName))
                .and(hasStatus(status))
                .and(hasRiskFlag(riskFlag));

        Page<Payment> payments = paymentRepository.findAll(spec, pageable);
        return payments.map(this::mapToResponse);
    }

     public Page<PaymentResponse> getMyPayments(String authenticatedEmail, String direction, Pageable pageable) {
        User currentUser = userRepository.findByEmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + authenticatedEmail));

        Specification<Payment> spec = buildMyPaymentsSpecification(currentUser.getId(), direction);

        Page<Payment> payments = paymentRepository.findAll(spec, pageable);
        return payments.map(this::mapToResponse);
    }

    private Specification<Payment> buildMyPaymentsSpecification(Long userId, String direction) {
        String normalizedDirection = direction == null ? "all" : direction.trim().toLowerCase();

        return switch (normalizedDirection) {
            case "sent" -> (root, query, cb) ->
                    cb.equal(root.get("sender").get("id"), userId);

            case "received" -> (root, query, cb) ->
                    cb.equal(root.get("recipient").get("id"), userId);

            case "all", "" -> (root, query, cb) ->
                    cb.or(
                            cb.equal(root.get("sender").get("id"), userId),
                            cb.equal(root.get("recipient").get("id"), userId)
                    );

            default -> throw new IllegalArgumentException(
                    "direction must be one of: all, sent, received."
            );
        };
    }
}