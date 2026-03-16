package com.martin.paymentflow.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;

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
import com.martin.paymentflow.api.enums.CurrencyCode;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.repository.PaymentRepository;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test") 
class PaymentIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private PaymentRepository paymentRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
    }

    @Test
    void createPayment_ShouldSavePaymentToDatabase() {
        String url = "http://localhost:" + port + "/api/payments";

        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setSenderName("Integration Test Sender");
        request.setRecipientName("Integration Test Recipient");
        request.setAmount(new BigDecimal("1500.00"));
        request.setCurrency(CurrencyCode.CAD);
        request.setReferenceNote("Integration test payment");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CreatePaymentRequest> httpEntity = new HttpEntity<>(request, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, httpEntity, String.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().contains("Integration Test Sender"));
        assertTrue(response.getBody().contains("Integration Test Recipient"));
        assertTrue(response.getBody().contains("COMPLETED"));

        assertEquals(1, paymentRepository.count());

        Payment savedPayment = paymentRepository.findAll().get(0);
        assertEquals("Integration Test Sender", savedPayment.getSenderName());
        assertEquals("Integration Test Recipient", savedPayment.getRecipientName());
        assertEquals(new BigDecimal("1500.00"), savedPayment.getAmount());
        assertEquals(CurrencyCode.CAD, savedPayment.getCurrency());
        assertEquals("Integration test payment", savedPayment.getReferenceNote());
    }

    @Test
    void getAllPayments_ShouldReturnSavedPayments() {
        Payment payment1 = new Payment();
        payment1.setTransactionId("TXN-INT-001");
        payment1.setSenderName("John Smith");
        payment1.setRecipientName("Alice Wong");
        payment1.setAmount(new BigDecimal("1200.50"));
        payment1.setCurrency(CurrencyCode.CAD);
        payment1.setStatus(PaymentStatus.PENDING);
        payment1.setReferenceNote("Integration payment one");
        payment1.setRiskFlag(false);
        payment1.setCreatedAt(java.time.OffsetDateTime.now());
        payment1.setUpdatedAt(java.time.OffsetDateTime.now());

        Payment payment2 = new Payment();
        payment2.setTransactionId("TXN-INT-002");
        payment2.setSenderName("Sarah Patel");
        payment2.setRecipientName("Tom Brown");
        payment2.setAmount(new BigDecimal("7000.00"));
        payment2.setCurrency(CurrencyCode.USD);
        payment2.setStatus(PaymentStatus.PENDING);
        payment2.setReferenceNote("Integration payment two");
        payment2.setRiskFlag(true);
        payment2.setCreatedAt(java.time.OffsetDateTime.now());
        payment2.setUpdatedAt(java.time.OffsetDateTime.now());

        paymentRepository.save(payment1);
        paymentRepository.save(payment2);

        String url = "http://localhost:" + port + "/api/payments?page=0&size=10";

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().contains("\"content\""));
        assertTrue(response.getBody().contains("\"totalElements\""));
        assertTrue(response.getBody().contains("TXN-INT-001"));
        assertTrue(response.getBody().contains("John Smith"));
        assertTrue(response.getBody().contains("TXN-INT-002"));
        assertTrue(response.getBody().contains("Sarah Patel"));
    }
}