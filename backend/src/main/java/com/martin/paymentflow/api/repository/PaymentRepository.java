package com.martin.paymentflow.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByTransactionIdContainingIgnoreCaseOrSenderNameContainingIgnoreCaseOrRecipientNameContainingIgnoreCase(
            String transactionId,
            String senderName,
            String recipientName
    );
 
}