package com.martin.paymentflow.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.dto.PaymentResponse;
import com.martin.paymentflow.api.dto.UpdatePaymentStatusRequest;
import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.enums.CurrencyCode;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.exception.ResourceNotFoundException;
import com.martin.paymentflow.api.repository.PaymentRepository;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private CreatePaymentRequest createPaymentRequest;

    @BeforeEach
    void setUp() {
        createPaymentRequest = new CreatePaymentRequest();
        createPaymentRequest.setSenderName("John Smith");
        createPaymentRequest.setRecipientName("Alice Wong");
        createPaymentRequest.setAmount(new BigDecimal("1200.50"));
        createPaymentRequest.setCurrency(CurrencyCode.CAD);
        createPaymentRequest.setReferenceNote("Invoice payment");
    }

    @Test
    void createPayment_ShouldSetPendingStatus_AndSavePayment() {
        Payment savedPayment = new Payment();
        savedPayment.setTransactionId("TXN-ABC12345");
        savedPayment.setSenderName(createPaymentRequest.getSenderName());
        savedPayment.setRecipientName(createPaymentRequest.getRecipientName());
        savedPayment.setAmount(createPaymentRequest.getAmount());
        savedPayment.setCurrency(createPaymentRequest.getCurrency());
        savedPayment.setReferenceNote(createPaymentRequest.getReferenceNote());
        savedPayment.setStatus(PaymentStatus.PENDING);
        savedPayment.setRiskFlag(false);
        savedPayment.setCreatedAt(OffsetDateTime.now());
        savedPayment.setUpdatedAt(OffsetDateTime.now());

        when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);

        PaymentResponse response = paymentService.createPayment(createPaymentRequest);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());

        Payment capturedPayment = paymentCaptor.getValue();

        assertEquals("John Smith", capturedPayment.getSenderName());
        assertEquals("Alice Wong", capturedPayment.getRecipientName());
        assertEquals(new BigDecimal("1200.50"), capturedPayment.getAmount());
        assertEquals(CurrencyCode.CAD, capturedPayment.getCurrency());
        assertEquals(PaymentStatus.PENDING, capturedPayment.getStatus());
        assertFalse(capturedPayment.isRiskFlag());

        assertEquals("TXN-ABC12345", response.getTransactionId());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
    }

    @Test
    void createPayment_ShouldSetRiskFlag_WhenAmountIsGreaterThan5000() {
        createPaymentRequest.setAmount(new BigDecimal("7000.00"));

        Payment savedPayment = new Payment();
        savedPayment.setTransactionId("TXN-HIGH001");
        savedPayment.setSenderName(createPaymentRequest.getSenderName());
        savedPayment.setRecipientName(createPaymentRequest.getRecipientName());
        savedPayment.setAmount(createPaymentRequest.getAmount());
        savedPayment.setCurrency(createPaymentRequest.getCurrency());
        savedPayment.setReferenceNote(createPaymentRequest.getReferenceNote());
        savedPayment.setStatus(PaymentStatus.PENDING);
        savedPayment.setRiskFlag(true);
        savedPayment.setCreatedAt(OffsetDateTime.now());
        savedPayment.setUpdatedAt(OffsetDateTime.now());

        when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);

        PaymentResponse response = paymentService.createPayment(createPaymentRequest);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());

        Payment capturedPayment = paymentCaptor.getValue();

        assertTrue(capturedPayment.isRiskFlag());
        assertTrue(response.isRiskFlag());
    }

    @Test
    void getPaymentByTransactionId_ShouldReturnPayment_WhenFound() {
        Payment payment = new Payment();
        payment.setTransactionId("TXN-SEED-001");
        payment.setSenderName("John Smith");
        payment.setRecipientName("Alice Wong");
        payment.setAmount(new BigDecimal("1200.50"));
        payment.setCurrency(CurrencyCode.CAD);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setReferenceNote("Invoice payment");
        payment.setRiskFlag(false);
        payment.setCreatedAt(OffsetDateTime.now());
        payment.setUpdatedAt(OffsetDateTime.now());

        when(paymentRepository.findByTransactionId("TXN-SEED-001")).thenReturn(Optional.of(payment));

        PaymentResponse response = paymentService.getPaymentByTransactionId("TXN-SEED-001");

        assertEquals("TXN-SEED-001", response.getTransactionId());
        assertEquals("John Smith", response.getSenderName());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
    }

    @Test
    void getPaymentByTransactionId_ShouldThrowException_WhenNotFound() {
        when(paymentRepository.findByTransactionId("TXN-MISSING")).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> paymentService.getPaymentByTransactionId("TXN-MISSING")
        );
    }

    @Test
    void updatePaymentStatus_ShouldUpdateStatus_WhenPaymentExists() {
        Payment payment = new Payment();
        payment.setTransactionId("TXN-SEED-001");
        payment.setSenderName("John Smith");
        payment.setRecipientName("Alice Wong");
        payment.setAmount(new BigDecimal("1200.50"));
        payment.setCurrency(CurrencyCode.CAD);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setReferenceNote("Invoice payment");
        payment.setRiskFlag(false);
        payment.setCreatedAt(OffsetDateTime.now());
        payment.setUpdatedAt(OffsetDateTime.now());

        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();
        request.setStatus(PaymentStatus.COMPLETED);

        Payment updatedPayment = new Payment();
        updatedPayment.setTransactionId("TXN-SEED-001");
        updatedPayment.setSenderName("John Smith");
        updatedPayment.setRecipientName("Alice Wong");
        updatedPayment.setAmount(new BigDecimal("1200.50"));
        updatedPayment.setCurrency(CurrencyCode.CAD);
        updatedPayment.setStatus(PaymentStatus.COMPLETED);
        updatedPayment.setReferenceNote("Invoice payment");
        updatedPayment.setRiskFlag(false);
        updatedPayment.setCreatedAt(payment.getCreatedAt());
        updatedPayment.setUpdatedAt(OffsetDateTime.now());

        when(paymentRepository.findByTransactionId("TXN-SEED-001")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(updatedPayment);

        PaymentResponse response = paymentService.updatePaymentStatus("TXN-SEED-001", request);

        assertEquals(PaymentStatus.COMPLETED, response.getStatus());
        verify(paymentRepository).save(payment);
    }
}