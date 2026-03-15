package com.martin.paymentflow.api.repository;

import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByTransactionIdContainingIgnoreCaseOrSenderNameContainingIgnoreCaseOrRecipientNameContainingIgnoreCase(
            String transactionId,
            String senderName,
            String recipientName
    );
}