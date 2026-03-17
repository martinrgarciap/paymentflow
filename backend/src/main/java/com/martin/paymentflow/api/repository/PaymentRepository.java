package com.martin.paymentflow.api.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {
    Optional<Payment> findByTransactionId(String transactionId);

    Page<Payment> findByTransactionIdContainingIgnoreCaseOrSenderNameContainingIgnoreCaseOrRecipientNameContainingIgnoreCase(
            String transactionId,
            String senderName,
            String recipientName,
            PaymentStatus status,
            Pageable pageable
    );
 
}