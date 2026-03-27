package com.martin.paymentflow.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.martin.paymentflow.api.dto.CreatePaymentRequest;
import com.martin.paymentflow.api.dto.PaymentResponse;
import com.martin.paymentflow.api.dto.UpdatePaymentStatusRequest;
import com.martin.paymentflow.api.entity.Payment;
import com.martin.paymentflow.api.entity.User;
import com.martin.paymentflow.api.enums.PaymentStatus;
import com.martin.paymentflow.api.exception.ResourceNotFoundException;
import com.martin.paymentflow.api.repository.PaymentRepository;
import com.martin.paymentflow.api.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentService paymentService;

    private User sender;
    private User recipient;

    @BeforeEach
    void setUp() {
        sender = new User();
        ReflectionTestUtils.setField(sender, "id", 1L);
        sender.setFirstName("Martin");
        sender.setLastName("Garcia");
        sender.setEmail("martin@example.com");
        sender.setPasswordHash("hashed");
        sender.setBalance(new BigDecimal("500.00"));
        sender.setAdmin(false);

        recipient = new User();
        ReflectionTestUtils.setField(recipient, "id", 2L);
        recipient.setFirstName("Alice");
        recipient.setLastName("Wong");
        recipient.setEmail("alice@example.com");
        recipient.setPasswordHash("hashed");
        recipient.setBalance(new BigDecimal("300.00"));
        recipient.setAdmin(false);
    }

    @Test
    @DisplayName("createPayment should complete immediately when sender has enough funds and amount is under threshold")
    void createPayment_ShouldCompleteImmediately() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setRecipientId(2L);
        request.setAmount(new BigDecimal("100.00"));
        request.setReferenceNote("Lunch");

        when(userRepository.findByEmailIgnoreCase("martin@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.createPayment(request, "martin@example.com");

        assertEquals("Martin Garcia", response.getSenderName());
        assertEquals("Alice Wong", response.getRecipientName());
        assertEquals(new BigDecimal("100.00"), response.getAmount());
        assertEquals(PaymentStatus.COMPLETED, response.getStatus());
        assertFalse(response.isRiskFlag());
        assertNull(response.getFailureReason());

        assertEquals(new BigDecimal("400.00"), sender.getBalance());
        assertEquals(new BigDecimal("400.00"), recipient.getBalance());
    }

    @Test
    @DisplayName("createPayment should fail when sender has insufficient funds and amount is under threshold")
    void createPayment_ShouldFailForInsufficientFunds() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setRecipientId(2L);
        request.setAmount(new BigDecimal("600.00"));
        request.setReferenceNote("Too much");

        when(userRepository.findByEmailIgnoreCase("martin@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.createPayment(request, "martin@example.com");

        assertEquals(PaymentStatus.FAILED, response.getStatus());
        assertEquals("Insufficient funds.", response.getFailureReason());
        assertEquals(new BigDecimal("500.00"), sender.getBalance());
        assertEquals(new BigDecimal("300.00"), recipient.getBalance());
    }

    @Test
    @DisplayName("createPayment should stay pending when amount is over approval threshold")
    void createPayment_ShouldBePendingWhenOverThreshold() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setRecipientId(2L);
        request.setAmount(new BigDecimal("6000.00"));
        request.setReferenceNote("Needs approval");

        when(userRepository.findByEmailIgnoreCase("martin@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.createPayment(request, "martin@example.com");

        assertEquals(PaymentStatus.PENDING, response.getStatus());
        assertTrue(response.isRiskFlag());
        assertNull(response.getFailureReason());
        assertEquals(new BigDecimal("500.00"), sender.getBalance());
        assertEquals(new BigDecimal("300.00"), recipient.getBalance());
    }

    @Test
    @DisplayName("createPayment should throw when recipient is missing")
    void createPayment_ShouldThrowWhenRecipientMissing() {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setRecipientId(999L);
        request.setAmount(new BigDecimal("100.00"));

        when(userRepository.findByEmailIgnoreCase("martin@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> paymentService.createPayment(request, "martin@example.com")
        );

        assertTrue(ex.getMessage().contains("Recipient not found"));
    }

    @Test
    @DisplayName("updatePaymentStatus should complete a pending payment and move balances")
    void updatePaymentStatus_ShouldCompletePendingPayment() {
        Payment payment = new Payment();
        payment.setTransactionId("TXN-12345678");
        payment.setSender(sender);
        payment.setRecipient(recipient);
        payment.setSenderName("Martin Garcia");
        payment.setRecipientName("Alice Wong");
        payment.setAmount(new BigDecimal("200.00"));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setReferenceNote("Approval");
        payment.setRiskFlag(true);
        payment.setCreatedAt(OffsetDateTime.now());
        payment.setUpdatedAt(OffsetDateTime.now());

        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();
        request.setStatus(PaymentStatus.COMPLETED);

        when(paymentRepository.findByTransactionId("TXN-12345678")).thenReturn(Optional.of(payment));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.updatePaymentStatus("TXN-12345678", request);

        assertEquals(PaymentStatus.COMPLETED, response.getStatus());
        assertNull(response.getFailureReason());
        assertEquals(new BigDecimal("300.00"), sender.getBalance());
        assertEquals(new BigDecimal("500.00"), recipient.getBalance());
    }

    @Test
    @DisplayName("createPayment should throw when sender is deactivated")
    void createPayment_ShouldThrow_WhenSenderIsDeactivated() {
        sender.setDeactivated(true);

        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setRecipientId(2L);
        request.setAmount(new BigDecimal("50.00"));
        request.setReferenceNote("Blocked sender");

        when(userRepository.findByEmailIgnoreCase("martin@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> paymentService.createPayment(request, "martin@example.com")
        );

        assertEquals("Deactivated users cannot send payments.", ex.getMessage());
    }

    @Test
    @DisplayName("createPayment should throw when recipient is deactivated")
    void createPayment_ShouldThrow_WhenRecipientIsDeactivated() {
        recipient.setDeactivated(true);

        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setRecipientId(2L);
        request.setAmount(new BigDecimal("50.00"));
        request.setReferenceNote("Blocked recipient");

        when(userRepository.findByEmailIgnoreCase("martin@example.com")).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> paymentService.createPayment(request, "martin@example.com")
        );

        assertEquals("Cannot send payments to a deactivated user.", ex.getMessage());
    }
}