package com.martin.paymentflow.api.config;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.entity.User;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.repository.PaymentRepository;
import com.martin.paymentflow.api.repository.UserRepository;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final int TOTAL_USERS = 500;
    private static final int TOTAL_PAYMENTS = 1000;
    private static final int DEACTIVATED_USER_COUNT = 25;
    private static final String DEFAULT_USER_PASSWORD = "password123";

    private static final String[] FIRST_NAMES = {
            "John", "Sarah", "Michael", "Emma", "Daniel", "Olivia", "Priya", "Lucas",
            "Sophia", "Ethan", "Ava", "Noah", "Isabella", "Liam", "Mia", "James",
            "Charlotte", "Benjamin", "Amelia", "Elijah", "Harper", "Mason", "Evelyn", "Logan",
            "Aria", "Jack", "Chloe", "Matthew", "Ella", "Samuel", "Nora", "Henry",
            "Zoe", "David", "Layla", "Joseph", "Lily", "Leo", "Hannah", "Gabriel",
            "Grace", "Julian", "Scarlett", "Owen", "Victoria", "Wyatt", "Aaliyah", "Nathan",
            "Brooklyn", "Isaac", "Sofia", "Andrew", "Paisley", "Anthony", "Claire", "Christopher",
            "Lucy", "Joshua", "Anna", "Caleb", "Aurora", "Ryan", "Ellie", "Adrian",
            "Bella", "Isaiah", "Hazel", "Thomas", "Naomi", "Charles", "Maya", "Christian",
            "Ruby", "Josiah", "Alice", "Hunter", "Eva", "Connor", "Madelyn", "Jonathan",
            "Kinsley", "Aaron", "Gianna", "Cameron", "Autumn", "Eli", "Kennedy", "Jeremiah",
            "Willow", "Nolan", "Samantha", "Colton", "Leah", "Easton", "Sadie", "Jordan"
    };

    private static final String[] LAST_NAMES = {
            "Smith", "Patel", "Lee", "Davis", "Kim", "Chen", "Singh", "Martin",
            "Brown", "Wong", "Clark", "Lopez", "Hall", "Young", "Allen", "Scott",
            "Green", "Baker", "Adams", "Nelson", "Carter", "Mitchell", "Perez", "Roberts",
            "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart",
            "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey",
            "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson",
            "Gray", "Ramirez", "James", "Watson", "Brooks", "Kelly", "Sanders", "Price",
            "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry",
            "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler", "Simmons",
            "Foster", "Gonzalez", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes",
            "Myers", "Ford", "Hamilton", "Graham", "Sullivan", "Wallace", "Woods", "Cole",
            "West", "Jordan", "Owens", "Reynolds", "Fisher", "Ellis", "Harrison", "Gibson"
    };

    private static final String[] NOTES = {
            "Invoice payment",
            "Subscription renewal",
            "Vendor payout",
            "Refund processed",
            "Client transfer",
            "Payroll disbursement",
            "Service fee",
            "Account adjustment",
            "Project milestone payment",
            "Consulting invoice",
            "Expense reimbursement",
            "Monthly transfer",
            "Emergency payment",
            "Bonus payout",
            "Reimbursement request",
            "Split dinner",
            "Rent contribution",
            "Freelance invoice",
            "Project retainer",
            "Adjustment entry"
    };

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Value("${app.seed.reset:false}")
    private boolean resetSeed;

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final Random random = new Random();

    // keep your FIRST_NAMES, LAST_NAMES, NOTES arrays here

    public DataSeeder(
            PaymentRepository paymentRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate
    ) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!seedEnabled) {
            System.out.println("Seeding disabled. Skipping data seed.");
            return;
        }

        if (resetSeed) {
            System.out.println("Reset flag enabled. Truncating users and payments.");
            jdbcTemplate.execute("TRUNCATE TABLE payments, users RESTART IDENTITY CASCADE");
        } else if (userRepository.count() > 0 || paymentRepository.count() > 0) {
            System.out.println("Users or payments already exist, skipping seed.");
            return;
        }

        List<User> users = seedUsers();
        seedPayments(users);

        System.out.println("Seed complete.");
        System.out.println("Default seeded user password: " + DEFAULT_USER_PASSWORD);
        System.out.println("Seeded admin email: admin@paymentflow.dev");
        System.out.println("Seeded active demo email: demo@paymentflow.dev");
        System.out.println("Seeded deactivated demo email: disabled@paymentflow.dev");
    }

    private List<User> seedUsers() {
        List<User> users = new ArrayList<>();
        Set<String> usedEmails = new HashSet<>();

        User adminUser = buildUser(
                "Admin",
                "User",
                "admin@paymentflow.dev",
                new BigDecimal("100000.00"),
                true,
                false
        );
        users.add(adminUser);
        usedEmails.add(adminUser.getEmail().toLowerCase());

        User demoUser = buildUser(
                "Demo",
                "User",
                "demo@paymentflow.dev",
                new BigDecimal("2500.00"),
                false,
                false
        );
        users.add(demoUser);
        usedEmails.add(demoUser.getEmail().toLowerCase());

        User disabledUser = buildUser(
                "Disabled",
                "User",
                "disabled@paymentflow.dev",
                new BigDecimal("1800.00"),
                false,
                true
        );
        users.add(disabledUser);
        usedEmails.add(disabledUser.getEmail().toLowerCase());

        int regularUsersNeeded = TOTAL_USERS - users.size();

        for (int i = 0; i < regularUsersNeeded; i++) {
            String firstName = randomFirstName();
            String lastName = randomLastName();
            String email = buildUniqueEmail(firstName, lastName, usedEmails);

            boolean isDeactivated = i < (DEACTIVATED_USER_COUNT - 1);

            User user = buildUser(
                    firstName,
                    lastName,
                    email,
                    randomUserBalance(),
                    false,
                    isDeactivated
            );

            users.add(user);
        }

        List<User> savedUsers = userRepository.saveAll(users);
        System.out.println("Seeded " + savedUsers.size() + " users.");
        return savedUsers;
    }

    private void seedPayments(List<User> users) {
        List<User> regularUsers = users.stream()
                .filter(user -> !user.isAdmin())
                .toList();

        List<Payment> payments = new ArrayList<>();

        for (int i = 1; i <= TOTAL_PAYMENTS; i++) {
            User sender = randomUser(regularUsers);
            User recipient = randomDifferentUser(regularUsers, sender);

            PaymentStatus status = randomStatus();
            BigDecimal amount = randomAmount();
            OffsetDateTime createdAt = randomCreatedAt();

            Payment payment = new Payment();
            payment.setTransactionId(String.format("TXN-%06d", i));
            payment.setSender(sender);
            payment.setRecipient(recipient);
            payment.setSenderName(sender.getFullName());
            payment.setRecipientName(recipient.getFullName());
            payment.setAmount(amount);
            payment.setStatus(status);
            payment.setReferenceNote(randomNote());
            payment.setRiskFlag(shouldFlag(amount, status));
            payment.setFailureReason(buildFailureReason(status));
            payment.setCreatedAt(createdAt);
            payment.setUpdatedAt(createdAt.plusMinutes(random.nextInt(1440)));

            payments.add(payment);
        }

        paymentRepository.saveAll(payments);
        System.out.println("Seeded " + payments.size() + " payment records.");
    }

    private User buildUser(
            String firstName,
            String lastName,
            String email,
            BigDecimal balance,
            boolean isAdmin,
            boolean isDeactivated
    ) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(DEFAULT_USER_PASSWORD));
        user.setBalance(balance);
        user.setAdmin(isAdmin);
        user.setDeactivated(isDeactivated);
        return user;
    }

    private String buildUniqueEmail(String firstName, String lastName, Set<String> usedEmails) {
        String base = (firstName + "." + lastName).toLowerCase().replace(" ", "");
        String email = base + "@paymentflow.dev";
        int counter = 1;

        while (usedEmails.contains(email)) {
            email = base + counter + "@paymentflow.dev";
            counter++;
        }

        usedEmails.add(email);
        return email;
    }

    private User randomUser(List<User> users) {
        return users.get(random.nextInt(users.size()));
    }

    private User randomDifferentUser(List<User> users, User sender) {
        User recipient = randomUser(users);
        while (recipient.getEmail().equalsIgnoreCase(sender.getEmail())) {
            recipient = randomUser(users);
        }
        return recipient;
    }

    private String randomFirstName() {
        return FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
    }

    private String randomLastName() {
        return LAST_NAMES[random.nextInt(LAST_NAMES.length)];
    }

    private String randomNote() {
        return NOTES[random.nextInt(NOTES.length)];
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

    private BigDecimal randomUserBalance() {
        double value = 100 + (20000 - 100) * random.nextDouble();
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private boolean shouldFlag(BigDecimal amount, PaymentStatus status) {
        return status == PaymentStatus.PENDING || amount.compareTo(new BigDecimal("5000.00")) > 0;
    }

    private String buildFailureReason(PaymentStatus status) {
        if (status == PaymentStatus.FAILED) {
            String[] reasons = {
                    "Insufficient funds.",
                    "Rejected by admin.",
                    "Validation check failed.",
                    "Recipient account unavailable."
            };
            return reasons[random.nextInt(reasons.length)];
        }
        return null;
    }

    private OffsetDateTime randomCreatedAt() {
        return OffsetDateTime.now()
                .minusDays(random.nextInt(90))
                .minusHours(random.nextInt(24))
                .minusMinutes(random.nextInt(60));
    }
}