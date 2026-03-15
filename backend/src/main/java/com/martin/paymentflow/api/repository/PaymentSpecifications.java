package com.martin.paymentflow.api.repository;

import org.springframework.data.jpa.domain.Specification;

import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.enums.PaymentStatus;

public class PaymentSpecifications {

    public static Specification<Payment> hasTransactionId(String transactionId) {
        return (root, query, cb) -> transactionId == null || transactionId.trim().isEmpty() ? null
            : cb.like(cb.lower(root.get("transactionId")), "%" + transactionId.toLowerCase() + "%");
    }

    public static Specification<Payment> hasSenderName(String senderName) {
        return (root, query, cb) -> senderName == null || senderName.trim().isEmpty() ? null
            : cb.like(cb.lower(root.get("senderName")), "%" + senderName.toLowerCase() + "%");
    }

    public static Specification<Payment> hasRecipientName(String recipientName) {
        return (root, query, cb) -> recipientName == null || recipientName.trim().isEmpty() ? null
            : cb.like(cb.lower(root.get("recipientName")), "%" + recipientName.toLowerCase() + "%");
    }

    public static Specification<Payment> hasStatus(PaymentStatus status) {
        return (root, query, cb) -> status == null ? null
            : cb.equal(root.get("status"), status);
    }
}