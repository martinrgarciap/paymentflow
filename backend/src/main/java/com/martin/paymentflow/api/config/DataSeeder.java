package com.martin.paymentflow.api.config;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.enums.CurrencyCode;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.repository.PaymentRepository;

@Profile("dev")
@Component
public class DataSeeder implements ApplicationRunner {

    private final PaymentRepository paymentRepository;
    private final Random random = new Random();

    private static final String[] FIRST_NAMES = {
            "John", "Sarah", "Michael", "Emma", "Daniel", "Olivia", "Priya", "Lucas",
            "Sophia", "Ethan", "Ava", "Noah", "Isabella", "Liam", "Mia", "James",
            "Charlotte", "Benjamin", "Amelia", "Elijah", "Harper", "Mason", "Evelyn", "Logan"
    };

    private static final String[] LAST_NAMES = {
            "Smith", "Patel", "Lee", "Davis", "Kim", "Chen", "Singh", "Martin",
            "Brown", "Wong", "Clark", "Lopez", "Hall", "Young", "Allen", "Scott",
            "Green", "Baker", "Adams", "Nelson", "Carter", "Mitchell", "Perez", "Roberts"
    };

    private static final String[] NOTES = {
            "Invoice payment",
            "Subscription renewal",
            "Vendor payout",
            "Refund processed",
            "Client transfer",
            "Payroll disbursement",
            "International payment",
            "Service fee",
            "Account adjustment",
            "Project milestone payment",
            "Consulting invoice",
            "Expense reimbursement"
    };

    public DataSeeder(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (paymentRepository.count() > 0) {
            System.out.println("Data already exists, skipping seed.");
            return;
        }

        System.out.println("Empty database detected. Seeding 1000 payments...");

        List<Payment> payments = new ArrayList<>();

        for (int i = 1; i <= 1000; i++) {
            PaymentStatus status = randomStatus();
            BigDecimal amount = randomAmount();
            boolean riskFlag = shouldFlag(amount, status);
            OffsetDateTime createdAt = randomCreatedAt();

            Payment payment = new Payment();
            payment.setTransactionId(String.format("TXN-%06d", i));
            payment.setSenderName(randomFullName());
            payment.setRecipientName(randomFullName());
            payment.setAmount(amount);
            payment.setCurrency(randomCurrency());
            payment.setStatus(status);
            payment.setReferenceNote(randomNote());
            payment.setRiskFlag(riskFlag);
            payment.setCreatedAt(createdAt);
            payment.setUpdatedAt(createdAt.plusMinutes(random.nextInt(1440)));

            payments.add(payment);
        }

        paymentRepository.saveAll(payments);
        System.out.println("Seeded 1000 payment records.");
    }

    private String randomFullName() {
        return FIRST_NAMES[random.nextInt(FIRST_NAMES.length)] + " " +
               LAST_NAMES[random.nextInt(LAST_NAMES.length)];
    }

    private String randomNote() {
        return NOTES[random.nextInt(NOTES.length)];
    }

    private CurrencyCode randomCurrency() {
        CurrencyCode[] currencies = CurrencyCode.values();
        return currencies[random.nextInt(currencies.length)];
    }

    private PaymentStatus randomStatus() {
        int pick = random.nextInt(100);
        if (pick < 55) return PaymentStatus.COMPLETED;
        if (pick < 75) return PaymentStatus.PENDING;
        if (pick < 93) return PaymentStatus.FAILED;
        return PaymentStatus.REVERSED;
    }

    private BigDecimal randomAmount() {
        double value = 10 + (10000 - 10) * random.nextDouble();
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private boolean shouldFlag(BigDecimal amount, PaymentStatus status) {
        return amount.compareTo(new BigDecimal("5000.00")) > 0 && random.nextBoolean();
    }

    private OffsetDateTime randomCreatedAt() {
        return OffsetDateTime.now()
                .minusDays(random.nextInt(90))
                .minusHours(random.nextInt(24))
                .minusMinutes(random.nextInt(60));
    }
}