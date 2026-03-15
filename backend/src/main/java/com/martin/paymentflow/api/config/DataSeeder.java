package com.martin.paymentflow.api.config;

import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.enums.CurrencyCode;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.repository.PaymentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PaymentRepository paymentRepository;

    public DataSeeder(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public void run(String... args) {
        if (paymentRepository.count() > 0) {
            return;
        }

        List<Payment> samplePayments = List.of(
                createPayment("TXN-SEED-001", "John Smith", "Alice Wong", new BigDecimal("1200.50"), CurrencyCode.CAD, PaymentStatus.PENDING, "Invoice payment", false),
                createPayment("TXN-SEED-002", "Sarah Patel", "Tom Brown", new BigDecimal("7000.00"), CurrencyCode.USD, PaymentStatus.FLAGGED, "High value transfer", true),
                createPayment("TXN-SEED-003", "Michael Lee", "Emma Davis", new BigDecimal("89.99"), CurrencyCode.CAD, PaymentStatus.COMPLETED, "Subscription renewal", false),
                createPayment("TXN-SEED-004", "Daniel Kim", "Olivia Chen", new BigDecimal("450.00"), CurrencyCode.EUR, PaymentStatus.FAILED, "International transfer", false),
                createPayment("TXN-SEED-005", "Priya Singh", "Lucas Martin", new BigDecimal("2300.00"), CurrencyCode.GBP, PaymentStatus.REVERSED, "Refund reversal", false)
        );

        paymentRepository.saveAll(samplePayments);
    }

    private Payment createPayment(
            String transactionId,
            String senderName,
            String recipientName,
            BigDecimal amount,
            CurrencyCode currency,
            PaymentStatus status,
            String referenceNote,
            boolean riskFlag
    ) {
        Payment payment = new Payment();
        payment.setTransactionId(transactionId);
        payment.setSenderName(senderName);
        payment.setRecipientName(recipientName);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setStatus(status);
        payment.setReferenceNote(referenceNote);
        payment.setRiskFlag(riskFlag);
        payment.setCreatedAt(OffsetDateTime.now());
        payment.setUpdatedAt(OffsetDateTime.now());
        return payment;
    }
}