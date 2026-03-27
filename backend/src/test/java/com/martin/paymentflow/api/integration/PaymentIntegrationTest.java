package com.martin.paymentflow.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.entity.User;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.repository.PaymentRepository;
import com.martin.paymentflow.api.repository.UserRepository;
import com.martin.paymentflow.api.service.JwtService;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class PaymentIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private final RestTemplate restTemplate = new RestTemplate();

    private User sender;
    private User recipient;
    private String senderToken;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        userRepository.deleteAll();

        sender = new User();
        sender.setFirstName("Integration");
        sender.setLastName("Sender");
        sender.setEmail("integration.sender@test.com");
        sender.setPasswordHash("$2a$10$abcdefghijklmnopqrstuv"); // not used directly
        sender.setBalance(new BigDecimal("500.00"));
        sender.setAdmin(false);
        sender = userRepository.save(sender);

        recipient = new User();
        recipient.setFirstName("Integration");
        recipient.setLastName("Recipient");
        recipient.setEmail("integration.recipient@test.com");
        recipient.setPasswordHash("$2a$10$abcdefghijklmnopqrstuv");
        recipient.setBalance(new BigDecimal("500.00"));
        recipient.setAdmin(false);
        recipient = userRepository.save(recipient);

        senderToken = jwtService.generateToken(sender);
    }

    @Test
    void createPayment_ShouldSavePaymentToDatabase() {
        String url = "http://localhost:" + port + "/api/payments";

        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setRecipientId(recipient.getId());
        request.setAmount(new BigDecimal("150.00"));
        request.setReferenceNote("Integration test payment");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(senderToken);

        HttpEntity<CreatePaymentRequest> httpEntity = new HttpEntity<>(request, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, httpEntity, String.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().contains("Integration Sender"));
        assertTrue(response.getBody().contains("Integration Recipient"));
        assertTrue(response.getBody().contains("COMPLETED"));

        assertEquals(1, paymentRepository.count());

        Payment savedPayment = paymentRepository.findAll().get(0);
        assertEquals("Integration Sender", savedPayment.getSenderName());
        assertEquals("Integration Recipient", savedPayment.getRecipientName());
        assertEquals(new BigDecimal("150.00"), savedPayment.getAmount());
        assertEquals("Integration test payment", savedPayment.getReferenceNote());
        assertEquals(PaymentStatus.COMPLETED, savedPayment.getStatus());
        assertNotNull(savedPayment.getSender());
        assertNotNull(savedPayment.getRecipient());
        assertEquals(sender.getId(), savedPayment.getSender().getId());
        assertEquals(recipient.getId(), savedPayment.getRecipient().getId());
    }

    @Test
    void getAllPayments_ShouldReturnSavedPayments() {
        Payment payment1 = new Payment();
        payment1.setTransactionId("TXN-INT-001");
        payment1.setSender(sender);
        payment1.setRecipient(recipient);
        payment1.setSenderName("John Smith");
        payment1.setRecipientName("Alice Wong");
        payment1.setAmount(new BigDecimal("1200.50"));
        payment1.setStatus(PaymentStatus.PENDING);
        payment1.setReferenceNote("Integration payment one");
        payment1.setRiskFlag(false);
        payment1.setCreatedAt(OffsetDateTime.now());
        payment1.setUpdatedAt(OffsetDateTime.now());

        Payment payment2 = new Payment();
        payment2.setTransactionId("TXN-INT-002");
        payment2.setSender(sender);
        payment2.setRecipient(recipient);
        payment2.setSenderName("Sarah Patel");
        payment2.setRecipientName("Tom Brown");
        payment2.setAmount(new BigDecimal("7000.00"));
        payment2.setStatus(PaymentStatus.PENDING);
        payment2.setReferenceNote("Integration payment two");
        payment2.setRiskFlag(true);
        payment2.setCreatedAt(OffsetDateTime.now());
        payment2.setUpdatedAt(OffsetDateTime.now());

        paymentRepository.save(payment1);
        paymentRepository.save(payment2);

        String url = "http://localhost:" + port + "/api/payments?page=0&size=10";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().contains("\"content\""));
        assertTrue(response.getBody().contains("\"totalElements\""));
        assertTrue(response.getBody().contains("TXN-INT-001"));
        assertTrue(response.getBody().contains("TXN-INT-002"));
        assertTrue(response.getBody().contains("Integration Sender"));
        assertTrue(response.getBody().contains("Integration Recipient"));
    }
}